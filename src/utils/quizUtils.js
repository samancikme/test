export const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const calculateScore = (questions, answers) => {
    let correctCount = 0;

    questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer === undefined || userAnswer === null || userAnswer === '') return;

        if (q.type === 'single' || q.type === 'boolean' || q.type === 'image-choice') {
            if (userAnswer === q.correctAnswer) correctCount++;
        }
        else if (q.type === 'multi') {
            if (!q.correctAnswers || !Array.isArray(userAnswer)) return;
            const isCorrectLength = userAnswer.length === q.correctAnswers.length;
            const allCorrect = userAnswer.every(ans => q.correctAnswers.includes(ans));
            if (isCorrectLength && allCorrect) correctCount++;
        }
        else if (q.type === 'statement-grid') {
            if (!q.statements || typeof userAnswer !== 'object') return;
            const allStatementsCorrect = q.statements.every(st => userAnswer[st.id] === st.correctAnswer);
            if (allStatementsCorrect) correctCount++;
        }
        else if (q.type === 'matching') {
            if (!q.pairs || typeof userAnswer !== 'object') return;
            // Each pair index should match: userAnswer[leftIdx] === rightIdx (same index = correct match)
            const allCorrect = q.pairs.every((_, idx) => userAnswer[idx] === idx);
            if (allCorrect) correctCount++;
        }
        else if (q.type === 'ordering') {
            if (!q.correctOrder || !Array.isArray(userAnswer)) return;
            const isCorrect = userAnswer.every((item, idx) => item === q.correctOrder[idx]);
            if (isCorrect) correctCount++;
        }
        else if (q.type === 'short-answer') {
            if (!q.correctAnswerText) return;
            const correct = String(q.correctAnswerText).toLowerCase().trim();
            const given = String(userAnswer).toLowerCase().trim();
            if (given === correct) correctCount++;
        }
    });

    return {
        correct: correctCount,
        total: questions.length,
        percentage: Math.round((correctCount / questions.length) * 100)
    };
};

export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
