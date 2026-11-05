const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createMusicSearch,genreReflection}=require('../utils/music');
test('online lookup encodes queries, caches and validates provider records',async()=>{
 let calls=0;
 const search=createMusicSearch(async(url)=>{calls++;assert.equal(url.searchParams.get('term'),'Song & Title Artist');assert.equal(url.hostname,'itunes.apple.com');return {ok:true,json:async()=>({results:[{kind:'song',trackId:1,trackName:'Song',artistName:'Artist',primaryGenreName:'Pop',trackViewUrl:'javascript:alert(1)'},{kind:'song',trackId:1,trackName:'Duplicate',artistName:'Artist'},{kind:'song',trackId:2,trackName:'Other',artistName:'Artist'}, {kind:'movie',trackId:3}]})};});
 const result=await search('Song & Title','Artist');assert.equal(result.length,2);assert.equal(result[0].sourceUrl,'');assert.equal(result[1].genre,'');
 await search('Song & Title','Artist');assert.equal(calls,1);
});
test('missing results and unavailable providers do not fabricate genres',async()=>{
 assert.deepEqual(await createMusicSearch(async()=>({ok:true,json:async()=>({results:[]})}))('Unknown'),[]);
 for(const fetcher of [async()=>{throw new Error('timeout');},async()=>({ok:false}),async()=>({ok:true,json:async()=>({bad:true})})]){
  await assert.rejects(createMusicSearch(fetcher)('Song'),{status:503});
 }
 assert.match(genreReflection('Bollywood'),/broad category/);
 assert.match(genreReflection(''),/broad category/);
});
test('provider requests are rate limited',async()=>{
 const search=createMusicSearch(async()=>({ok:true,json:async()=>({results:[]})}));
 for(let i=0;i<18;i++)await search('Song '+i);
 await assert.rejects(search('Another song'),{status:429});
});
