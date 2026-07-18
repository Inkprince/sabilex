import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';

    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const pdfParseFn = pdfParse.default || pdfParse;
      const pdfData = await pdfParseFn(buffer);
      text = pdfData.text;
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Parse file error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse file' }, { status: 500 });
  }
}
