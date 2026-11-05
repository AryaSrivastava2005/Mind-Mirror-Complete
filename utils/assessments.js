const assessments = require('../data/assessments.json');
const options = [ ['0','Never'], ['1','Rarely'], ['2','Sometimes'], ['3','Often'], ['4','Almost always'] ];
function validate(config, body) {
  return body && body.adult === 'yes' && body.understand === 'yes' && config.sections.every(s => s.questions.every(q => typeof body[q.id] === 'string' && options.some(([v]) => v === body[q.id])));
}
function summarize(config, body) {
  const sections = config.sections.map(s => {
    const answered = s.questions.filter(q => body[q.id] !== 'skip');
    const counts = [0,0,0,0,0]; answered.forEach(q => counts[Number(body[q.id])]++);
    return {title:s.title, answered:answered.length, skipped:10-answered.length, counts,
      frequent:answered.filter(q => Number(body[q.id]) >= 3).map(q => ({text:q.text, answer:options[Number(body[q.id])][1]}))};
  });
  return { assessmentId:config.id, title:config.title, version:config.version, timeframe:'Current daily experience', sections,
    answered:sections.reduce((n,s)=>n+s.answered,0), skipped:sections.reduce((n,s)=>n+s.skipped,0) };
}
module.exports = {assessments,options,validate,summarize};
