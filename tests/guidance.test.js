const {test}=require('node:test');
const assert=require('node:assert/strict');
const ejs=require('ejs');
const path=require('node:path');
const {assessments,summarize}=require('../utils/assessments');
const {describeReport}=require('../utils/assessment-guidance');
test('result charts and guidance handle mixed, skipped and older saved reports',async()=>{
 for(const config of Object.values(assessments)){
  const body=Object.fromEntries(config.sections.flatMap(s=>s.questions).map(q=>[q.id,'skip']));
  body[config.sections[0].questions[0].id]='3';
  body[config.sections[0].questions[1].id]='4';
  const report=summarize(config,body), insights=describeReport(report);
  assert.equal(insights[0].frequentCount,2);
  assert.equal(insights[0].answered,2);
  assert.equal(insights[0].skipped,8);
  assert.match(insights[0].description,/partial picture/);
  assert.match(insights[1].description,/not enough information/);
  assert.ok(insights.every(s=>s.tips.length===2));
  for(const saved of [false,true]){
   const html=await ejs.renderFile(path.join(__dirname,'../views/assessment-result.ejs'),{report:{...report,id:'test',version:'1.0',timeframe:'Past two weeks'},insights,saved,csrf:'test',currentUser:{name:'Test',username:'test'},currentPath:'/assessments/result/test',message:null});
   assert.ok(!html.includes('<table'));
   assert.ok(!html.includes('NaN'));
   assert.ok(html.includes('width:20%'));
   assert.ok(html.includes('No answers'));
   assert.ok(html.includes('Past two weeks'));
  }
  for(const k of Object.keys(body))body[k]='skip';
  const empty=summarize(config,body);
  assert.ok(describeReport(empty).every(s=>s.frequentCount===0));
 }
});
