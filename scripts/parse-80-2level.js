import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const inputPath = path.join(rootDir, '80-2level.json');
const outputPath = path.join(rootDir, 'src', 'data', 'Level_2_80_Questions.json');

const rawData = fs.readFileSync(inputPath, 'utf8');
const level2Data = JSON.parse(rawData);

const letterToId = {
    'A': 'o1', 'B': 'o2', 'C': 'o3', 'D': 'o4',
    'E': 'o5', 'F': 'o6', 'G': 'o7', 'H': 'o8'
};

const cleanOptionText = (text) => {
    return text.replace(/^[A-H][.)\-]\s*/, '').trim();
};

const convertedQuestions = level2Data.map((q, idx) => {
    const qNum = idx + 1;
    const id = `l2-80q-q${q.id || qNum}`;
    const questionText = q.savol;
    const topic = "Level 2 (80 Questions)";
    
    let type = 'single';
    let options = [];
    let statements = [];
    let pairs = [];
    let correctAnswers = [];
    let correctAnswer = undefined;
    let instruction = "";
    
    // 1. Check if javob is a map (object but not array)
    if (q.javob && !Array.isArray(q.javob) && typeof q.javob === 'object') {
        const javobValues = Object.values(q.javob);
        const standardChoices = ['true', 'false', 'yes', 'no', 'accurate', 'inaccurate', 'ergonomic', 'non-ergonomic', 'appropriate', 'inappropriate'];
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
            } else if (uniqueValsLower.has('appropriate') || uniqueValsLower.has('inappropriate')) {
                options = [{ id: 'Appropriate', text: 'Appropriate' }, { id: 'Inappropriate', text: 'Inappropriate' }];
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
    } else {
        // Option list (single or multi choice)
        options = q.variantlar.map((v, oIdx) => ({
            id: `o${oIdx + 1}`,
            text: cleanOptionText(v)
        }));
        
        const isMulti = Array.isArray(q.javob) || (typeof q.javob === 'string' && q.javob.length > 1 && q.javob.includes(','));
        let answersList = [];
        
        if (Array.isArray(q.javob)) {
            answersList = q.javob;
        } else if (typeof q.javob === 'string') {
            answersList = q.javob.split(',').map(s => s.trim());
        }
        
        const isLetterBased = answersList.every(ans => /^[A-H]$/.test(ans));
        
        if (isMulti) {
            type = 'multi';
            if (isLetterBased) {
                correctAnswers = answersList.map(ans => letterToId[ans] || ans.toLowerCase());
            } else {
                correctAnswers = answersList.map(ansText => {
                    const optIndex = q.variantlar.findIndex(v => cleanOptionText(v) === cleanOptionText(ansText));
                    return optIndex !== -1 ? `o${optIndex + 1}` : null;
                }).filter(Boolean);
            }
            instruction = `Choose ${correctAnswers.length} correct options.`;
        } else {
            type = 'single';
            const singleAns = answersList[0] || '';
            if (/^[A-H]$/.test(singleAns)) {
                correctAnswer = letterToId[singleAns];
            } else {
                const optIndex = q.variantlar.findIndex(v => cleanOptionText(v) === cleanOptionText(singleAns));
                correctAnswer = optIndex !== -1 ? `o${optIndex + 1}` : 'o1';
            }
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
