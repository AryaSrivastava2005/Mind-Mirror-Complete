const types = {
 unspecified: 'Not specified', upbeat: 'Upbeat / energetic', gentle: 'Gentle / calming',
 reflective: 'Reflective / melancholy', intense: 'Intense / dramatic', nostalgic: 'Familiar / nostalgic'
};
const profiles = [
 [/bollywood|soundtrack|world|indian|regional/i, 'Story, scene and connection', 'Film and regional categories can contain love songs, celebrations, grief, devotion and many other themes.', 'You may connect with a scene, language, relationship or memory more than the genre itself.', 'Which lyric, scene or memory makes this track meaningful to you?'],
 [/dance|electronic|house|techno|disco/i, 'Rhythm and movement', 'Consider whether the rhythm feels energising, playful, absorbing or repetitive to you.', 'You might be celebrating, preparing for an activity or trying to lift your energy; enjoying a beat does not imply that you already feel happy.', 'Do you want this track to match your energy or change it?'],
 [/metal|rock|punk/i, 'Intensity and expression', 'Consider whether the sound offers excitement, determination, emotional expression or a sense of release.', 'You might enjoy intensity, feel understood by the lyrics or use the rhythm for motivation. The choice does not establish anger or distress.', 'After listening, do you feel more settled, more activated or much the same?'],
 [/ambient|new age|classical/i, 'Space and attention', 'Consider whether the arrangement feels spacious, focused, soothing or dramatic; this category can include both quiet and powerful music.', 'You might want room to think, background sound for a task or an expressive musical experience.', 'Does this recording help you attend to a task or invite you to pause?'],
 [/hip.hop|rap|r&b|soul/i, 'Voice, rhythm and identity', 'Consider whether you connect with confidence, vulnerability, storytelling, connection or the rhythm itself.', 'The lyrics might echo an experience, express something you want to feel, or simply be enjoyable to sing along with.', 'Are the words expressing your experience, someone else’s story or an aspiration?'],
 [/jazz|blues|folk|country|singer.songwriter/i, 'Storytelling and reflection', 'Consider whether the performance feels thoughtful, warm, wistful, playful or comforting to you.', 'You might be drawn to the story, musicianship or familiarity. A reflective song can be enjoyable without matching sadness in the listener.', 'What draws your attention most: the story, the voice, an instrument or a memory?'],
 [/pop/i, 'Familiarity and connection', 'Consider whether the melody and lyrics feel joyful, romantic, wistful or encouraging; pop spans many emotional tones.', 'You may want a familiar chorus, shared experience, distraction or an energy boost.', 'Are you choosing this song for its message, its familiarity or how it sounds?']
];
const typePrompts = {
 unspecified: ['Track type not specified', 'The catalog genre alone does not tell us the emotional tone of this particular recording. Choose a track type if one fits.'],
 upbeat: ['If it feels upbeat to you', 'You might be matching an energetic feeling or seeking more energy. Ask: am I celebrating, getting started or looking for a change?'],
 gentle: ['If it feels gentle to you', 'You might enjoy quiet, want space to focus or be seeking a softer moment. Ask: what would a comfortable pace look like right now?'],
 reflective: ['If it feels reflective to you', 'You might be exploring a memory, relating to a story or enjoying the melody. This does not establish sadness. Ask: what part of the song feels relevant?'],
 intense: ['If it feels intense to you', 'You might seek motivation, expression or immersion in the sound. Ask: does this intensity leave me feeling how I want to feel?'],
 nostalgic: ['If it feels familiar or nostalgic', 'You might be reconnecting with a person, place or earlier time. Memories can bring mixed feelings. Ask: what do I miss, appreciate or want to carry forward?']
};
function musicInsights(genre, type='unspecified') {
 const safeType=Object.hasOwn(types,type)?type:'unspecified';
 const row=profiles.find(p=>p[0].test(genre||''));
 const [title,themes,reasons,prompt]=row?row.slice(1):['Your personal connection','The source does not provide enough genre detail for a specific theme.','Enjoyment, memories, focus and curiosity are all possible reasons for choosing music.','What drew you to this particular recording today?'];
 return {title,themes,reasons,prompt,type:safeType,typeLabel:types[safeType],typeTitle:typePrompts[safeType][0],typeReflection:typePrompts[safeType][1],tip:'Notice how you feel before and after listening. If this track is not giving you the experience you want, try a different track or take a quiet break. Your own description matters more than a genre label.'};
}
module.exports={types,musicInsights};
