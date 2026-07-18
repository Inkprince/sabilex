import { NextRequest } from 'next/server';
import { Index } from '@upstash/vector';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

function getIndex() {
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    return null;
  }
  return new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
  });
}

function getGroq() {
  return createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const index = getIndex();
    if (!index) {
      return new Response(
        JSON.stringify({ error: 'Upstash credentials missing. Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN in .env.local.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            'Groq API key missing. Please set GROQ_API_KEY in your .env.local file.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: must include a "messages" array.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages: ChatMessage[] = body.messages;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const query = lastUserMessage.content.trim();
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Search Upstash Vector for relevant legal documents
    const searchResults = await index.query({
      data: query,
      topK: 5,
      includeMetadata: true,
    });

    const sources = searchResults.map((r) => {
      const meta = r.metadata as Record<string, string>;
      return {
        id: String(r.id),
        title: meta?.title ?? 'Unknown Document',
        source: meta?.source ?? 'Nigerian Law',
        chapter: meta?.chapter ?? '',
        sections: meta?.sections ?? '',
        snippet: meta?.snippet ?? '',
        category: meta?.category ?? 'constitution',
        score: Math.round((r.score ?? 0) * 100) / 100,
      };
    });

    // Build RAG context from retrieved documents
    const contextDocs = searchResults
      .map((r, i) => {
        const meta = r.metadata as Record<string, string>;
        return `[DOCUMENT ${i + 1}]
Title: ${meta?.title ?? 'Unknown'}
Source: ${meta?.source ?? 'Nigerian Law'}
Chapter/Sections: ${meta?.chapter ?? ''} ${meta?.sections ?? ''}
Content: ${meta?.snippet ?? ''}`;
      })
      .join('\n\n---\n\n');

    const systemPrompt = `You are SabiLex, an AI legal assistant specializing in Nigerian constitutional and statutory law. You help Nigerian citizens understand their legal rights.

RULES:
1. ONLY use information from the provided legal documents. Never invent provisions.
2. Always cite the exact document title and section number.
3. If a question isn't covered by the documents, say so clearly.
4. Give practical, plain-English guidance that anyone can understand.
5. Be concise but thorough. Use markdown formatting.
6. End with a brief disclaimer about seeking professional legal advice.

RETRIEVED LEGAL DOCUMENTS:
${contextDocs}`;

    // Build the message history for the LLM
    const llmMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const groq = getGroq();

    // Create a custom readable stream that sends structured events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Event 1: Send sources
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'sources', sources })}\n\n`
          )
        );

        // Event 2: Signal that analysis is starting
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'status', status: 'analyzing' })}\n\n`
          )
        );

        // Event 3: Stream the LLM response
        try {
          const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: systemPrompt,
            messages: llmMessages,
          });

          const textStream = result.textStream;

          for await (const chunk of textStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'done' })}\n\n`
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown streaming error';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: msg })}\n\n`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[/api/chat] Error:', message);

    if (message.includes('Embedding data for this index is not allowed')) {
      return new Response(
        JSON.stringify({
          error: 'Upstash index was created without an embedding model. Recreate it with "mxbai-embed-large-v1" selected.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Chat failed: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
