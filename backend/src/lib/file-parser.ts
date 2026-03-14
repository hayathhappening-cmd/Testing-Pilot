import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function parseUploadedFile(file?: Express.Multer.File | null) {
  if (!file) {
    return "";
  }

  const filename = file.originalname.toLowerCase();

  if (filename.endsWith(".txt") || filename.endsWith(".md") || filename.endsWith(".json")) {
    return file.buffer.toString("utf-8");
  }

  if (filename.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (filename.endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  return file.buffer.toString("utf-8");
}
