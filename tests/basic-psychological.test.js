const {test} = require('node:test');
const assert = require('node:assert/strict');
const {questions, validate, summarize} = require('../utils/basic-psychological');
test('basic reflection requires scalar choices and keeps counts literal', () => {
  assert.equal(questions.length,15);
  const answers=Object.fromEntries(questions.map(q=>[q.id,'agree']));
  assert.equal(validate(answers),true);
  for (const bad of [undefined,'', '3', 'skip', ['agree'], '<script>']) assert.equal(validate({...answers,b1:bad}),false);
  assert.throws(()=>summarize({}));
  const agreed=summarize(answers);assert.equal(agreed.agree,15);assert.equal(agreed.disagree,0);
  assert.equal(agreed.items[0].reflection,questions[0].agree);
  const disagreed=summarize(Object.fromEntries(questions.map(q=>[q.id,'disagree'])));
  assert.equal(disagreed.agree,0);assert.equal(disagreed.disagree,15);
  assert.equal(disagreed.items[14].reflection,questions[14].disagree);
});
