import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docxPath = path.join(rootDir, '2-level 1-30.docx');

async function extractText() {
    try {
        const result = await mammoth.extractRawText({ path: docxPath });
        const text = result.value;
        fs.writeFileSync(path.join(rootDir, 'scripts', 'extracted_docx.txt'), text);
        console.log("Extracted text. Length:", text.length);
    } catch (err) {
        console.error("Error reading docx:", err);
    }
}

extractText();
