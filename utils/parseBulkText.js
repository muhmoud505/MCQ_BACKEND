const parseBulkText = (rawText, subjectId) => {
  if (typeof rawText !== 'string') return [];

  const blocks = rawText
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b !== '');

  const parsedQuestions = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l !== '');

    let questionText = '';
    let answerText = '';
    let options = [];
    let type = 'flashcard';

    for (const line of lines) {
      if (line.startsWith('>')) {
        answerText = line.substring(1).trim();
      } else if (line.startsWith('-')) {
        options.push(line.substring(1).trim());
        type = 'multiple_choice';
      } else if (!questionText) {
        questionText = line;
      } else {
        questionText += ' ' + line;
      }
    }

    if (type !== 'multiple_choice' && ['true', 'false'].includes(answerText.toLowerCase())) {
      type = 'true_false';
    }

    if (!questionText || !answerText) continue;

    const questionObj = {
      subjectId,
      question: questionText,
      answer: answerText,
      type,
      difficulty: 'medium',
    };

    if (type === 'multiple_choice') {
      questionObj.options = options;
      const correctIndex = options.findIndex(
        (opt) => opt.toLowerCase() === answerText.toLowerCase()
      );
      questionObj.correctOptionIndex = correctIndex !== -1 ? correctIndex : 0;
    }

    if (type === 'true_false') {
      questionObj.correctBoolean = answerText.toLowerCase() === 'true';
    }

    parsedQuestions.push(questionObj);
  }

  return parsedQuestions;
};

module.exports = parseBulkText;
