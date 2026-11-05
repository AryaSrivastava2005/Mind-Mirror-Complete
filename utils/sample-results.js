const basic = require('./basic-psychological');
const leadership = require('./leadership-teamwork');
function build(type, answers) {
 let sections;
 if(type === 'basic-psychological') {
  const all=basic.summarize(answers).items;
  sections=[['Decisions & planning',[1,3,5,8]],['Social experience',[2,6,9,14]],['Values',[10,15]],['Learning & motivation',[7,11,13]],['Emotional expression',[4,12]]].map(([title,ids])=>({title,items:ids.map(id=>all[id-1])}));
 } else sections=leadership.summarize(answers);
 sections=sections.map(s=>({...s,agree:s.items.filter(i=>i.answer==='agree').length,total:s.items.length}));
 return {type,title:type==='basic-psychological'?'Basic Psychological Test':'Leadership, Stress & Teamwork Test',sections,agree:sections.reduce((n,s)=>n+s.agree,0),total:15,version:'1.7'};
}
function history(db,userId) {
 return [
 ...db.results.map(r=>({id:r.id,userId:r.userId,createdAt:r.createdAt,title:'Personality Test',description:r.resultDescription,url:'/result/'+r.id})),
 ...(db.sampleResults||[]).map(r=>({...r,description:`Agreed with ${r.agree} of ${r.total} statements.`,url:'/sample-tests/result/'+r.id})),
 ...(db.assessmentResults||[]).map(r=>({...r,description:`${r.answered} items answered; ${r.skipped} skipped.`,url:'/assessments/result/'+r.id}))
 ].filter(r=>r.userId===userId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
module.exports={build,history};
