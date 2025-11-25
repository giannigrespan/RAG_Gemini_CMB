import { KnowledgeDocument } from '../types';

// Declare globals for the libraries loaded via CDN in index.html
declare const pdfjsLib: any;
declare const mammoth: any;

export const extractTextFromFiles = async (files: File[]): Promise<KnowledgeDocument[]> => {
    const promises = files.map(file => processFile(file));
    return Promise.all(promises);
};

const processFile = async (file: File): Promise<KnowledgeDocument> => {
    let content = '';
    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                     file.name.toLowerCase().endsWith('.docx') ? 'docx' : 'txt';

    try {
        if (fileType === 'pdf') {
            content = await extractPdfText(file);
        } else if (fileType === 'docx') {
            content = await extractDocxText(file);
        } else {
            content = await file.text();
        }
    } catch (e) {
        console.error(`Failed to parse ${file.name}`, e);
        content = `[ERRORE: Impossibile leggere il contenuto di ${file.name}]`;
    }

    return {
        id: crypto.randomUUID(),
        name: file.name,
        type: fileType,
        size: file.size,
        uploadDate: Date.now(),
        content: content
    };
};

const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `Page ${i}:\n${pageText}\n\n`;
    }

    return fullText;
};

const extractDocxText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
};