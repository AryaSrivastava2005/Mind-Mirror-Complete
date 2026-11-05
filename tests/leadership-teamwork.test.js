const {test} = require('node:test');
const assert = require('node:assert/strict');
const {sections,validate,summarize} = require('../utils/leadership-teamwork');
test('leadership sections validate choices and count independently',()=>{
 assert.equal(sections.length,3);
 const answers=Object.fromEntries(sections.flatMap((s,i)=>s.questions.map(q=>[q.id,i===0?'agree':'disagree'])));
 assert.equal(validate(answers),true);
 for(const bad of [undefined,'skip','', ['agree'],'toString']) assert.equal(validate({...answers,l1:bad}),false);
 assert.throws(()=>summarize({}));
 const report=summarize(answers);
 assert.deepEqual(report.map(s=>s.agree),[5,0,0]);
 assert.deepEqual(report.map(s=>s.disagree),[0,5,5]);
 assert.equal(report[2].items[4].answer,'disagree');
});
