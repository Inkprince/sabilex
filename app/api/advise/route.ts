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

export async function POST(req: NextRequest) {
  try {
    const index = getIndex();
    if (!index) {
      return new Response(JSON.stringify({ error: 'Upstash credentials missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
    if (!body || typeof body.scenario !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: must include a "scenario" string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const scenario = body.scenario.trim();
    if (!scenario) {
      return new Response(JSON.stringify({ error: 'Scenario cannot be empty.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Retrieve most relevant legal documents
    const results = await index.query({
      data: scenario,
      topK: 5,
      includeMetadata: true,
    });

    const contextDocs = results
      .map((r, i) => {
        const meta = r.metadata as Record<string, string>;
        return `[DOCUMENT ${i + 1}]
Title: ${meta?.title ?? 'Unknown'}
Source: ${meta?.source ?? 'Nigerian Law'}
Chapter/Sections: ${meta?.chapter ?? ''} ${meta?.sections ?? ''}
Content: ${meta?.snippet ?? ''}`;
      })
      .join('\n\n---\n\n');

    const systemPrompt = `You are SabiLex, an AI assistant specializing in Nigerian constitutional law and legal rights. You help Nigerian citizens understand their legal rights based ONLY on the provided source documents.

CRITICAL RULES:
1. ONLY use information from the provided documents. Do NOT invent legal provisions.
2. Always cite the exact document title and section when making a legal statement.
3. If a scenario is not covered by the provided documents, say so clearly.
4. Provide practical, plain-English guidance that an ordinary Nigerian can act on.
5. Always include appropriate disclaimers about seeking professional legal advice.

Your response MUST follow this exact structure:

## ⚖️ Your Rights in This Situation

[2-3 sentences summarizing the most relevant rights that apply]

## 📜 Relevant Legal Provisions

[For each relevant provision, format as:]
**[Section/Provision Name]** — *[Document Title]*
> [Exact or paraphrased quote from the document]
[Brief explanation of how this applies to the scenario]

## ✅ What You Can Do

[Numbered list of practical steps the person can take, grounded in the law]

## 🚨 Important Disclaimer

*This is a general information summary based on Nigerian constitutional and statutory documents. It is not legal advice. For your specific situation, consult a qualified legal practitioner. For urgent matters involving arrest or detention, contact a lawyer or the Legal Aid Council of Nigeria immediately.*`;

    const userMessage = `A Nigerian citizen is facing this situation:

"${scenario}"

Using ONLY the following legal documents, advise them on their rights:

${contextDocs}

Provide a structured, plain-English response following the format in your instructions.`;

    const groq = getGroq();
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[/api/advise] Error:', message);

    if (message.includes('Embedding data for this index is not allowed')) {
      return new Response(
        JSON.stringify({
          error:
            'Upstash DB Error: Your index was created without an embedding model. Please recreate it in the Upstash console with "mxbai-embed-large-v1" selected.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: `Rights advisor failed: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
