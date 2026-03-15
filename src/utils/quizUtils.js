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
        if (!userAnswer) return;

        if (q.type === 'single' || q.type === 'boolean' || q.type === 'image-choice') {
            if (userAnswer === q.correctAnswer) correctCount++;
        }
        else if (q.type === 'multi') {
            const isCorrectLength = userAnswer.length === q.correctAnswers.length;
            const allCorrect = userAnswer.every(ans => q.correctAnswers.includes(ans));
            if (isCorrectLength && allCorrect) correctCount++;
        }
        else if (q.type === 'statement-grid') {
            const allStatementsCorrect = q.statements.every(st => userAnswer[st.id] === st.correctAnswer);
            if (allStatementsCorrect) correctCount++;
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
