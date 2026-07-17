import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const inputPath = path.join(rootDir, 'taza134.json');
const outputPath = path.join(rootDir, 'src', 'data', 'Taza134_Converted.json');

const rawData = fs.readFileSync(inputPath, 'utf8');
const level3Data = JSON.parse(rawData);

const convertedQuestions = level3Data.map((q, idx) => {
    const qNum = idx + 1;
    const id = `t134-q${q.id || qNum}`;
    const questionText = q.savol;
    const topic = "Level 3 (Taza 134)";
    
    // Determine type:
    let type = 'single';
    let options = [];
    let statements = [];
    let pairs = [];
    let correctAnswers = [];
    let correctAnswer = undefined;
    let instruction = "";
    
    if (q.variantlar && !Array.isArray(q.variantlar) && typeof q.variantlar === 'object') {
        // Option object (A, B, C...)
        const isMulti = Array.isArray(q.javob);
        const keyMap = {
            'A': 'o1', 'B': 'o2', 'C': 'o3', 'D': 'o4',
            'E': 'o5', 'F': 'o6', 'G': 'o7', 'H': 'o8'
        };
        
        options = Object.keys(q.variantlar).map(k => {
            return {
                id: keyMap[k] || k.toLowerCase(),
                text: q.variantlar[k]
            };
        });
        
        if (isMulti) {
            type = 'multi';
            correctAnswers = q.javob.map(ansKey => keyMap[ansKey] || ansKey.toLowerCase());
            instruction = `Choose ${q.javob.length} correct options.`;
        } else {
            type = 'single';
            correctAnswer = keyMap[q.javob] || q.javob.toLowerCase();
        }
    } else if (Array.isArray(q.variantlar)) {
        // Option array
        if (q.javob && !Array.isArray(q.javob) && typeof q.javob === 'object') {
            // javob is a map (statement-grid or matching)
            const javobValues = Object.values(q.javob || {});
            const standardChoices = ['true', 'false', 'yes', 'no', 'accurate', 'inaccurate', 'ergonomic', 'non-ergonomic'];
            const isStatementGrid = javobValues.length > 0 && javobValues.every(val => standardChoices.includes(String(val).toLowerCase().trim()));
            
            if (isStatementGrid) {
                type = 'statement-grid';
                const uniqueValsLower = new Set(javobValues.map(v => String(v).toLowerCase().trim()));
                if (uniqueValsLower.has('yes') || uniqueValsLower.has('no')) {
                    options = [{ id: 'Yes', text: 'Yes' }, { id: 'No', text: 'No' }];
                } else if (uniqueValsLower.has('accurate') || uniqueValsLower.has('inaccurate')) {
                    options = [{ id: 'Accurate', text: 'Accurate' }, { id: 'Inaccurate', text: 'Inaccurate' }];
                } else if (uniqueValsLower.has('ergonomic') || uniqueValsLower.has('non-ergonomic')) {
                    options = [{ id: 'Ergonomic', text: 'Ergonomic' }, { id: 'Non-Ergonomic', text: 'Non-Ergonomic' }];
                } else {
                    options = [{ id: 'True', text: 'True' }, { id: 'False', text: 'False' }];
                }
                
                statements = q.variantlar.map((stmtText, sIdx) => {
                    let ans = q.javob[stmtText];
                    if (ans === undefined) {
                        const keys = Object.keys(q.javob);
                        const matchingKey = keys.find(k => k.trim() === stmtText.trim());
                        if (matchingKey) ans = q.javob[matchingKey];
                    }
                    
                    const matchedOption = options.find(o => o.id.toLowerCase() === String(ans).toLowerCase().trim());
                    const correctAnswerValue = matchedOption ? matchedOption.id : String(ans);
                    
                    return {
                        id: `s${sIdx + 1}`,
                        text: stmtText,
                        correctAnswer: correctAnswerValue
                    };
                });
            } else {
                type = 'matching';
                pairs = q.variantlar.map((item, pIdx) => {
                    let rightVal = q.javob[item];
                    if (rightVal === undefined) {
                        const keys = Object.keys(q.javob);
                        const matchingKey = keys.find(k => k.trim() === item.trim());
                        if (matchingKey) rightVal = q.javob[matchingKey];
                    }
                    return {
                        left: item,
                        right: rightVal || ""
                    };
                });
            }
        } else if (Array.isArray(q.javob)) {
            // javob is an array of strings representing correct options
            type = 'multi';
            options = q.variantlar.map((v, oIdx) => ({
                id: `o${oIdx + 1}`,
                text: v
            }));
            
            correctAnswers = q.javob.map(ansText => {
                const optIndex = q.variantlar.findIndex(v => v.trim() === ansText.trim());
                return optIndex !== -1 ? `o${optIndex + 1}` : null;
            }).filter(Boolean);
            
            instruction = `Choose ${correctAnswers.length} correct options.`;
        } else if (typeof q.javob === 'string') {
            // javob is a string representing correct option text
            type = 'single';
            options = q.variantlar.map((v, oIdx) => ({
                id: `o${oIdx + 1}`,
                text: v
            }));
            
            const optIndex = q.variantlar.findIndex(v => v.trim() === q.javob.trim());
            correctAnswer = optIndex !== -1 ? `o${optIndex + 1}` : 'o1';
        }
    }
    
    const convertedQ = {
        id,
        questionNumber: qNum,
        questionText,
        topic,
        type
    };
    
    if (instruction) convertedQ.instruction = instruction;
    if (options.length > 0) convertedQ.options = options;
    if (statements.length > 0) convertedQ.statements = statements;
    if (pairs.length > 0) convertedQ.pairs = pairs;
    if (correctAnswers.length > 0) convertedQ.correctAnswers = correctAnswers;
    if (correctAnswer !== undefined) convertedQ.correctAnswer = correctAnswer;
    
    return convertedQ;
});

fs.writeFileSync(outputPath, JSON.stringify(convertedQuestions, null, 2));
console.log(`Successfully converted ${convertedQuestions.length} questions to ${outputPath}`);
