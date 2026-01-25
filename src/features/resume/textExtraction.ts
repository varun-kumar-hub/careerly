// Polyfills for pdf-parse in Node environment
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// Minimal polyfill for DOMMatrix which pdfjs-dist (used by pdf-parse) might need
if (!global.DOMMatrix) {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        // Add methods if specifically needed, usually just existence is enough for load
    } as any;
}

const pdfParse = require("pdf-parse");
import mammoth from "mammoth";

// ...

/**
 * Extracts raw text content from a file buffer.
 * Supports PDF and DOCX formats.
 * 
 * @param fileBuffer - The binary buffer of the file.
 * @param fileType - The MIME type of the file.
 * @returns The extracted text as a string.
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
    try {
        // Handle potential default export in different envs
        const parser = pdfParse.default || pdfParse;

        if (typeof parser !== 'function') {
            throw new Error(`pdf-parse export is not a function: ${typeof parser}`);
        }

        const data = await parser(buffer);

        if (!data || typeof data.text !== 'string') {
            throw new Error("PDF parsed but no text content found.");
        }
        return data.text;
    } catch (error: any) {
        console.error("PDF Extraction Error Detail:", error?.message || error);
        throw new Error(`Failed to parse PDF file: ${error?.message || "Unknown error"}`);
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
