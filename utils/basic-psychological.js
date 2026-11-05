const questions = require('../data/basic-psychological.json');
function validate(answers) {
  return questions.every(q => typeof answers[q.id] === 'string' && ['agree', 'disagree'].includes(answers[q.id]));
}
function summarize(answers) {
  if (!validate(answers)) throw new Error('Complete all 15 items using Agree or Disagree.');
  const items = questions.map(q => ({...q, answer: answers[q.id], reflection: q[answers[q.id]]}));
  const agree = items.filter(q => q.answer === 'agree').length;
  return {items, agree, disagree: questions.length - agree};
}
module.exports = {questions, validate, summarize};
