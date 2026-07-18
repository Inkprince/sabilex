import * as fs from 'fs';
import * as path from 'path';
import { Index } from '@upstash/vector';

// Load env from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
  console.error('❌  Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN in .env.local');
  process.exit(1);
}

const index = new Index({
  url: UPSTASH_VECTOR_REST_URL,
  token: UPSTASH_VECTOR_REST_TOKEN,
});

function parseFrontmatter(content: string): { metadata: Record<string, string>; body: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { metadata: {}, body: content };

  const metadata: Record<string, string> = {};
  fmMatch[1].split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const k = line.slice(0, colonIdx).trim();
      const v = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      metadata[k] = v;
    }
  });

  return { metadata, body: fmMatch[2].trim() };
}

function chunkText(text: string, maxWords = 400, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  if (words.length <= maxWords) {
    return [text];
  }

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end === words.length) break;
    start += maxWords - overlap;
  }

  return chunks;
}

async function ingest() {
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.md'));

  console.log(`\n🚀 SabiLex Ingestion Script`);
  console.log(`📁 Found ${files.length} documents in /data\n`);

  let totalChunks = 0;
  const vectors: Array<{ id: string; data: string; metadata: Record<string, string | number> }> = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const { metadata, body } = parseFrontmatter(content);

    const chunks = chunkText(body, 400, 50);
    console.log(`  📄 ${metadata.title || file} → ${chunks.length} chunk(s)`);

    for (let i = 0; i < chunks.length; i++) {
      const id = `${file.replace('.md', '')}-chunk-${i}`;
      vectors.push({
        id,
        data: chunks[i],
        metadata: {
          title: metadata.title || file,
          source: metadata.source || 'Nigerian Law',
          chapter: metadata.chapter || '',
          category: metadata.category || 'constitution',
          sections: metadata.sections || '',
          chunkIndex: i,
          totalChunks: chunks.length,
          snippet: chunks[i].slice(0, 200),
        },
      });
      totalChunks++;
    }
  }

  // Upsert in batches of 10
  const batchSize = 10;
  console.log(`\n⬆️  Upserting ${totalChunks} chunks to Upstash Vector...`);

  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
    console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)} done`);
  }

  console.log(`\n🎉 Ingestion complete! ${totalChunks} chunks stored in Upstash Vector.`);
  console.log(`📊 Ready for SabiLex queries.\n`);
}

ingest().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Embedding data for this index is not allowed')) {
    console.error('\n❌ Upstash Configuration Error: Your vector database was created without an embedding model.');
    console.error('   Please go to upstash.com, delete this index, and create a new one.');
    console.error('   CRITICAL: You must select a Built-in Embedding Model (e.g. "mxbai-embed-large-v1") when creating it!\n');
  } else {
    console.error('❌ Ingestion failed:', err);
  }
  process.exit(1);
});
