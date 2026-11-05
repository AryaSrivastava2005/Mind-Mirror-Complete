const sections = require('../data/leadership-teamwork.json');
const questions = sections.flatMap(s => s.questions);
function validate(answers) {
  return questions.every(q => typeof answers[q.id] === 'string' && ['agree', 'disagree'].includes(answers[q.id]));
}
function summarize(answers) {
  if (!validate(answers)) throw new Error('Answer all 15 statements using Agree or Disagree.');
  return sections.map(section => {
    const items = section.questions.map(q => ({...q, answer: answers[q.id]}));
    const agree = items.filter(q => q.answer === 'agree').length;
    return {...section, items, agree, disagree: items.length - agree};
  });
}
module.exports = {sections, validate, summarize};
