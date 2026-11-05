const {test}=require('node:test');const assert=require('node:assert/strict');
const {musicInsights}=require('../utils/music-insights');
test('music reflections vary by genre and user-described type with safe fallback',()=>{
 const rock=musicInsights('Rock','intense'),pop=musicInsights('Pop','gentle');
 assert.notEqual(rock.themes,pop.themes);assert.notEqual(rock.typeReflection,pop.typeReflection);
 assert.equal(musicInsights('','fake').type,'unspecified');
 assert.match(musicInsights('').themes,/not provide enough genre detail/);
 assert.match(musicInsights('Bollywood','nostalgic').typeReflection,/Memories/);
});
