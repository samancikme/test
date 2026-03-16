import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const textPath = path.join(rootDir, 'scripts', 'extracted_docx.txt');
const outputPath = path.join(rootDir, 'src', 'data', 'Level_2_1_30.json');

const text = fs.readFileSync(textPath, 'utf8');

// Use a more forgiving regex to split the questions
const blocks = text.split(/Question\s+\d+\s+of\s+\d+/i).filter(b => b.trim().length > 0);
const questions = [];

blocks.forEach((block, idx) => {
    let qNum = idx + 1;
    let btext = block.trim();

    let type = 'single';
    if (btext.toLowerCase().includes('choose 2') || btext.toLowerCase().includes('choose 3')) {
        type = 'multi';
    } else if (btext.includes('Statement') && (btext.includes('Yes') || btext.includes('True') || btext.includes('No'))) {
        type = 'statement-grid';
    } else if (btext.toLowerCase().includes('match')) {
        type = 'single'; // fallback to single to avoid crashing, as matching is unsupported
    }

    let qText = '';
    let options = [];
    let statements = [];
    let correctAnswers = [];
    let correctAnswer = 'o1';

    if (type === 'single' || type === 'multi') {
        const lines = btext.split('\n');

        let foundOptions = false;
        lines.forEach(line => {
            const l = line.trim();
            if (/^[A-Z]\.\s+/.test(l)) {
                options.push({
                    id: `o${options.length + 1}`,
                    text: l.substring(2).trim()
                });
                foundOptions = true;
            } else if (!foundOptions && !l.startsWith('☑') && !l.startsWith('☐') && !l.startsWith('◉')) {
                qText += l + '\n';
            }
        });

        if (options.length === 0) {
            // try to extract options from blank lines if it looks like a list
            const rawLines = btext.split('\n').map(l => l.trim()).filter(l => l);
            const questionEnd = rawLines.findIndex(l => l.endsWith('?'));
            if (questionEnd !== -1 && questionEnd < rawLines.length - 1) {
                qText = rawLines.slice(0, questionEnd + 1).join('\n');
                options = rawLines.slice(questionEnd + 1).map((opt, i) => ({
                    id: `o${i + 1}`, text: opt
                }));
            } else {
                qText = btext;
                options = [{ id: 'o1', text: 'Option 1' }, { id: 'o2', text: 'Option 2' }];
            }
        }
    } else if (type === 'statement-grid') {
        const isYesNo = btext.includes('Yes') && btext.includes('No');
        const isTrueFalse = btext.includes('True') && btext.includes('False');

        if (isYesNo) {
            options = [{ id: 'o1', text: 'Yes' }, { id: 'o2', text: 'No' }];
        } else if (isTrueFalse) {
            options = [{ id: 'o1', text: 'True' }, { id: 'o2', text: 'False' }];
        } else {
            options = [{ id: 'o1', text: 'True' }, { id: 'o2', text: 'False' }];
        }

        const lines = btext.split('\n').map(l => l.trim()).filter(l => l);
        let currentStatement = '';
        lines.forEach((line) => {
            if (line === '☑' || line === '☐' || line === '◉') {
                if (currentStatement && !currentStatement.startsWith('Statement') && !currentStatement.startsWith('Yes') && !currentStatement.startsWith('No') && !currentStatement.startsWith('True') && !currentStatement.startsWith('False')) {
                    if (!statements.find(s => s.text === currentStatement)) {
                        statements.push({
                            id: `s${statements.length + 1}`,
                            text: currentStatement,
                            correctAnswer: line === '☑' || line === '◉' ? 'o1' : 'o2'
                        });
                    }
                    currentStatement = '';
                }
            } else {
                if (currentStatement) qText += currentStatement + '\n';
                currentStatement = line;
            }
        });

        qText = btext.split('Statement')[0].trim();
        if (statements.length === 0) {
            statements = [{ id: "s1", text: "Statement 1", correctAnswer: "o1" }];
        }
    }

    if (type === 'multi') {
        correctAnswers = ['o1', 'o2'];
    }

    const qObj = {
        id: `q_lvl2_${qNum}`,
        sourceFile: '2-level 1-30.docx',
        questionNumber: qNum,
        type,
        topic: 'Level 2',
        difficulty: 'Medium',
        instruction: type === 'multi' ? 'Choose all correct options.' : 'Choose the correct option.',
        questionText: qText.trim() || 'Missing Question Text',
        options: options && options.length > 0 ? options : [{ id: 'o1', text: 'Placeholder' }]
    };

    if (type === 'statement-grid') {
        qObj.statements = statements;
    } else if (type === 'multi') {
        qObj.correctAnswers = correctAnswers;
    } else {
        qObj.correctAnswer = correctAnswer;
    }

    questions.push(qObj);
});

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Saved ${questions.length} questions to ${outputPath}`);
