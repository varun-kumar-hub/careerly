import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(fileBuffer: Buffer, fileType: string): Promise<string> {
    if (fileType === "application/pdf" || fileType.endsWith("pdf")) {
        return extractTextFromPDF(fileBuffer);
    } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType.endsWith("docx")
    ) {
        return extractTextFromDOCX(fileBuffer);
    } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
    }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        throw new Error("Failed to parse PDF file.");
    }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error("DOCX Extraction Error:", error);
        throw new Error("Failed to parse DOCX file.");
    }
}
