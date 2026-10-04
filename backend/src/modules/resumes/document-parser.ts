import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '../../errors/app-error';

export interface ExtractedDocument { text: string; metadata: Record<string, unknown>; }
export interface DocumentParser { supports(mimeType: string): boolean; parse(buffer: Buffer): Promise<ExtractedDocument>; }

class PdfParser implements DocumentParser {
  supports(mimeType: string) { return mimeType === 'application/pdf'; }
  async parse(buffer: Buffer) {
    try {
      const result = await pdfParse(buffer);
      return { text: result.text.replace(/\r/g, '').trim(), metadata: { pages: result.numpages } };
    } catch { throw new AppError('DOCUMENT_PARSE_FAILED', 422, 'The PDF could not be parsed'); }
  }
}

class DocxParser implements DocumentParser {
  supports(mimeType: string) { return mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; }
  async parse(buffer: Buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value.replace(/\r/g, '').trim(), metadata: { messages: result.messages.map((message) => message.type) } };
    } catch { throw new AppError('DOCUMENT_PARSE_FAILED', 422, 'The DOCX could not be parsed'); }
  }
}

const parsers: DocumentParser[] = [new PdfParser(), new DocxParser()];
export function getDocumentParser(mimeType: string): DocumentParser {
  const parser = parsers.find((candidate) => candidate.supports(mimeType));
  if (!parser) throw new AppError('UNSUPPORTED_RESUME_TYPE', 415, 'Only PDF and DOCX resumes are supported');
  return parser;
}
