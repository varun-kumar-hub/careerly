
import mammoth from "mammoth";
// @ts-ignore
import PDFParser from "pdf2json";

/**
 * Extracts raw text content from a file buffer.
 * Supports PDF and DOCX formats.
 */
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
    return new Promise((resolve, reject) => {
        try {
            const pdfParser = new PDFParser(null, true); // true = raw text mode

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF2JSON Error:", errData);
                reject(new Error(errData.parserError));
            });

            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                // pdfData.formImage.Pages[].Texts[].R[].T is where text is.
                // But generally pdfParser.getRawTextContent() is efficient if available.
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            });

            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
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
