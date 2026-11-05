const {test}=require('node:test');const assert=require('node:assert/strict');
const {assessments,options,validate,summarize}=require('../utils/assessments');
for(const config of Object.values(assessments))test(config.title+' content and honest summaries',()=>{
 const items=config.sections.flatMap(s=>s.questions);assert.equal(items.length,60);assert.equal(new Set(items.map(q=>q.id)).size,60);assert.equal(new Set(items.map(q=>q.text)).size,60);assert.equal(items.filter(q=>q.kind==='Situation').length,30);assert.equal(items.filter(q=>q.kind==='Question').length,30);
 assert.equal(options.some(([v])=>v==='skip'),false);
 const body={adult:'yes',understand:'yes',...Object.fromEntries(items.map(q=>[q.id,'0']))};assert.ok(validate(config,body));assert.equal(summarize(config,body).answered,60);
 assert.equal(validate(config,{...body,[items[0].id]:'skip'}),false);
 body[items[0].id]='4';body[items[1].id]='skip';const result=summarize(config,body);assert.equal(result.answered,59);assert.equal(result.skipped,1);assert.equal(result.sections[0].frequent.length,1);assert.deepEqual(result.sections[0].counts,[8,0,0,0,1]);assert.equal(result.totalScore,undefined);
 for(const bad of ['5','-1','', ['2'],{},undefined]){assert.equal(validate(config,{...body,[items[0].id]:bad}),false);}
 assert.equal(validate(config,{...body,adult:'no'}),false);assert.equal(validate(config,{...body,understand:''}),false);
 for(const q of items)body[q.id]='skip';assert.equal(summarize(config,body).answered,0);
});
