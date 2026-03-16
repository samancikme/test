import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');

const files = ['Level_1_80_SORAW.json', 'Report_Responses.json'];

function cleanText(text) {
    // Remove variations of "-- X of Y --"
    return text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
}

function processData(data) {
    let modifiedCount = 0;

    const processed = data.map(q => {
        let text = q.questionText || '';
        text = cleanText(text);

        // Fix statement grid type questions
        if (text.includes('Answer Area')) {
            const parts = text.split('Answer Area');
            if (parts.length === 2) {
                const qText = parts[0].trim();
                const statementsText = parts[1].trim();

                // Determine options based on question text
                let opts = [];
                if (qText.toLowerCase().includes('yes') && qText.toLowerCase().includes('no')) {
                    opts = [
                        { id: 'o1', text: 'Yes' },
                        { id: 'o2', text: 'No' }
                    ];
                } else if (qText.toLowerCase().includes('true') && qText.toLowerCase().includes('false')) {
                    opts = [
                        { id: 'o1', text: 'True' },
                        { id: 'o2', text: 'False' }
                    ];
                } else if (qText.toLowerCase().includes('app') && qText.toLowerCase().includes('os')) {
                    opts = [
                        { id: 'o1', text: 'App' },
                        { id: 'o2', text: 'OS' }
                    ];
                }

                if (opts.length > 0) {
                    const lines = statementsText.split('\n').map(l => l.trim()).filter(l => l);
                    const statements = [];

                    lines.forEach((line, idx) => {
                        let stText = line;
                        let correctAnswer = null;

                        // Check if line ends with one of the options
                        for (const opt of opts) {
                            if (stText.endsWith(opt.text)) {
                                stText = stText.slice(0, -opt.text.length).trim();
                                correctAnswer = opt.id;
                                break;
                            }
                        }

                        if (stText) {
                            statements.push({
                                id: `s${idx + 1}`,
                                text: stText,
                                correctAnswer
                            });
                        }
                    });

                    if (statements.length > 0) {
                        q.type = 'statement-grid';
                        q.questionText = qText;
                        q.options = opts;
                        q.statements = statements;
                        delete q.correctAnswer;
                        delete q.correctAnswers;
                        modifiedCount++;
                    }
                }
            }
        }

        q.questionText = text;

        // Also clean up option texts
        if (q.options && Array.isArray(q.options)) {
            q.options.forEach(opt => {
                if (opt.text) opt.text = cleanText(opt.text);
            });
        }

        return q;
    });

    return { processed, modifiedCount };
}

for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        const { processed, modifiedCount } = processData(data);

        fs.writeFileSync(filePath, JSON.stringify(processed, null, 2));
        console.log(`Processed ${file}: Modified ${modifiedCount} questions into statement-grids.`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
}
