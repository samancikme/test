import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfParseModule from 'pdf-parse';

const pdfParse = pdfParseModule.default || pdfParseModule.PDFParse || pdfParseModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');
const imagesDir = path.join(rootDir, 'public', 'images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Files to process
const pdfFiles = [
    { file: '1-Level_1_80_SORAW.pdf', output: 'Level_1_80_SORAW.json' },
    { file: 'Report - Responses.pdf', output: 'Report_Responses.json' }
];

async function extractDataFromPdf(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return null;
    }
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const parserText = new pdfParse({ data: new Uint8Array(dataBuffer) });
        const textData = await parserText.getText();

        const parserImages = new pdfParse({ data: new Uint8Array(dataBuffer) });
        let imageData = { pages: [] };
        try {
            imageData = await parserImages.getImage({ imageBuffer: true, imageThreshold: 50 });
        } catch (e) {
            console.log("Could not extract images:", e.message);
        }

        return { text: textData.text, images: imageData };
    } catch (err) {
        console.error(`Error parsing ${filePath}:`, err);
        return null;
    }
}

function parseQuestionsFormat1(text, sourceFile) {
    const questions = [];
    // Regex to match "Question \d+ of \d+ [text] A. [text] B. [text] ..."
    const blockRegex = /Question (\d+) of \d+\s+([\s\S]*?)(?=\nQuestion \d+ of \d+|\n\nQuestion |$)/g;

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        const qBlock = match[2].trim();

        // Extract options, looking for A., B., C., D. etc
        const optionRegex = /([A-E])\.\s+([^\n]*(?:\n(?![A-E]\.\s)[^\n]*)*)/g;
        let optMatch;
        const options = [];
        let optionTextStart = qBlock.length;

        while ((optMatch = optionRegex.exec(qBlock)) !== null) {
            if (options.length === 0) {
                optionTextStart = optMatch.index;
            }
            options.push({
                id: `o${options.length + 1}`,
                label: optMatch[1],
                text: optMatch[2].trim()
            });
        }

        const questionText = qBlock.slice(0, optionTextStart).trim();

        const isMulti = questionText.includes('(Choose 2.)') || questionText.includes('(Choose 3.)');

        if (options.length > 0 || questionText.length > 10) {
            questions.push({
                id: `q${sourceFile.slice(0, 5)}_${qNum}`,
                sourceFile,
                questionNumber: qNum,
                type: isMulti ? 'multi' : 'single',
                topic: 'General',
                difficulty: 'Medium',
                instruction: isMulti ? 'Choose all correct options.' : 'Choose the correct option.',
                questionText: questionText,
                options: options.length > 0 ? options : undefined,
                correctAnswer: isMulti ? [] : (options.length > 0 ? "o1" : undefined) // Placeholder, manual review needed for this format
            });
        }
    }
    return questions;
}

function parseQuestionsFormat2(text, sourceFile) {
    const questions = [];
    // Matches "1. Question text ... Option ✓ Option ✘"
    const blockRegex = /\n(\d+)\.\s+([\s\S]*?)(?=\n\d+\.\s+|$)/g;

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        let qBlock = match[2].trim();

        // Stop at "Points:" if it exists
        const pointsIndex = qBlock.indexOf('Points:');
        if (pointsIndex !== -1) {
            qBlock = qBlock.slice(0, pointsIndex).trim();
        }

        // Try to separate question text from options by looking for ✓ or ✘
        const lines = qBlock.split('\n');
        const options = [];
        let questionLines = [];
        let currentOptionText = '';
        let isCollectingOptions = false;

        // This is a very rough heuristic for Report - Responses format
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '✓' || line === '✘') {
                isCollectingOptions = true;
                if (currentOptionText) {
                    options.push({
                        id: `o${options.length + 1}`,
                        text: currentOptionText.trim(),
                        isCorrect: line === '✓'
                    });
                    currentOptionText = '';
                } else if (options.length > 0) {
                    // Sometimes the checkmark is on the next line
                    options[options.length - 1].isCorrect = line === '✓';
                }
            } else if (line.endsWith('✓') || line.endsWith('✘')) {
                isCollectingOptions = true;
                const isCorrect = line.endsWith('✓');
                const optText = line.slice(0, -1).trim();
                options.push({
                    id: `o${options.length + 1}`,
                    text: optText,
                    isCorrect
                });
            } else {
                if (isCollectingOptions) {
                    currentOptionText += ' ' + line;
                } else {
                    questionLines.push(line);
                }
            }
        }

        if (currentOptionText) {
            // Leftover text
            options.push({
                id: `o${options.length + 1}`,
                text: currentOptionText.trim(),
                isCorrect: false
            });
        }

        const questionText = questionLines.join('\n').trim();
        const correctOptions = options.filter(o => o.isCorrect).map(o => o.id);
        const isMulti = correctOptions.length > 1;

        if (questionText.length > 5) {
            questions.push({
                id: `q${sourceFile.slice(0, 5)}_${qNum}`,
                sourceFile,
                questionNumber: qNum,
                type: isMulti ? 'multi' : 'single',
                topic: 'General',
                difficulty: 'Medium',
                instruction: isMulti ? 'Choose all correct options.' : 'Choose the correct option.',
                questionText: questionText,
                options: options.map(o => ({ id: o.id, text: o.text })),
                ...(isMulti ? { correctAnswers: correctOptions } : { correctAnswer: correctOptions[0] || options[0]?.id || 'o1' })
            });
        }
    }
    return questions;
}

function processImagesHeuristic(questions, extractedImages, sourceFileName) {
    let allImages = [];
    if (extractedImages && extractedImages.pages) {
        extractedImages.pages.forEach((p, pIdx) => {
            if (p.images) {
                p.images.forEach((img, iIdx) => {
                    if (img.data) {
                        allImages.push({ buff: img.data, id: `p${pIdx}_i${iIdx}` });
                    }
                });
            }
        });
    }

    let imgIdx = 0;
    for (let i = 0; i < questions.length; i++) {
        const text = questions[i].questionText.toLowerCase();
        if (imgIdx < allImages.length && (text.includes('image') || text.includes('shown') || text.includes('picture') || text.includes('diagram'))) {
            const imgObj = allImages[imgIdx];
            const imgName = `${sourceFileName.replace('.pdf', '')}_${imgObj.id}.png`;
            fs.writeFileSync(path.join(imagesDir, imgName), imgObj.buff);
            questions[i].image = `/images/${imgName}`;
            imgIdx++;
        }
    }

    for (let i = 0; i < questions.length; i++) {
        if (imgIdx < allImages.length && !questions[i].image) {
            const imgObj = allImages[imgIdx];
            const imgName = `${sourceFileName.replace('.pdf', '')}_${imgObj.id}.png`;
            fs.writeFileSync(path.join(imagesDir, imgName), imgObj.buff);
            questions[i].image = `/images/${imgName}`;
            imgIdx++;
        }
    }

    return questions;
}

async function main() {
    for (const fileObj of pdfFiles) {
        const filePath = path.join(rootDir, fileObj.file);
        const data = await extractDataFromPdf(filePath);

        if (data && data.text) {
            const { text, images } = data;
            console.log(`Processing ${fileObj.file}...`);
            let extracted = [];

            // Infer format from content
            if (text.includes('Question 1 of')) {
                extracted = parseQuestionsFormat1(text, fileObj.file);
            } else if (text.includes('Points:') || text.includes('✓')) {
                extracted = parseQuestionsFormat2(text, fileObj.file);
            } else {
                // Try format 1 as fallback
                extracted = parseQuestionsFormat1(text, fileObj.file);
                if (extracted.length === 0) {
                    extracted = parseQuestionsFormat2(text, fileObj.file);
                }
            }

            // Heuristic image assignment
            extracted = processImagesHeuristic(extracted, images, fileObj.file);

            console.log(`Extracted ${extracted.length} questions from ${fileObj.file}`);

            if (extracted.length > 0) {
                const outPath = path.join(dataDir, fileObj.output);
                fs.writeFileSync(outPath, JSON.stringify(extracted, null, 2));
                console.log(`Successfully wrote ${extracted.length} questions to ${outPath}`);
            } else {
                console.log(`No questions extracted for ${fileObj.file}`);
            }
        }
    }
}

main().catch(console.error);
