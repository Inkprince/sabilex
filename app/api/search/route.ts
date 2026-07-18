import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';

function getIndex() {
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    return null;
  }
  return new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });
}

export async function POST(req: NextRequest) {
  try {
    const index = getIndex();
    if (!index) {
      return NextResponse.json(
        {
          error:
            'Server configuration error: Upstash credentials are missing. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN in your .env.local file.',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: body must be JSON with a "query" string field.' },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    if (!query) {
      return NextResponse.json({ error: 'Query cannot be empty.' }, { status: 400 });
    }

    if (query.length > 1000) {
      return NextResponse.json(
        { error: 'Query is too long. Please keep it under 1000 characters.' },
        { status: 400 }
      );
    }

    const results = await index.query({
      data: query,
      topK: 6,
      includeMetadata: true,
    });

    const formatted = results.map((r) => ({
      id: r.id,
      title: (r.metadata as Record<string, string>)?.title ?? 'Unknown Document',
      source: (r.metadata as Record<string, string>)?.source ?? '',
      chapter: (r.metadata as Record<string, string>)?.chapter ?? '',
      category: (r.metadata as Record<string, string>)?.category ?? 'constitution',
      sections: (r.metadata as Record<string, string>)?.sections ?? '',
      snippet: (r.metadata as Record<string, string>)?.snippet ?? '',
      score: Math.round((r.score ?? 0) * 100) / 100,
    }));

    return NextResponse.json({ results: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[/api/search] Error:', message);

    if (message.includes('Embedding data for this index is not allowed')) {
      return NextResponse.json(
        {
          error:
            'Upstash DB Error: Your index was created without an embedding model. Please recreate it in the Upstash console with "mxbai-embed-large-v1" selected.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: `Search failed: ${message}` }, { status: 500 });
  }
}
