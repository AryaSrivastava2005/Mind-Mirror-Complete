const moods = ['Happy', 'Calm', 'Sad', 'Anxious', 'Energised', 'Nostalgic', 'Mixed', 'Not sure', 'Prefer not to say'];
function validText(value, max, required = false) { return typeof value === 'string' && value.trim().length <= max && (!required || value.trim().length > 0); }
// Reflection prompts, not validated predictions about an individual listener.
function genreReflection(genre) {
  const g = (genre || '').toLowerCase();
  if (!g || /bollywood|soundtrack|world|indian|regional/.test(g)) return 'This broad category includes many different emotions. Consider whether this song feels comforting, exciting, reflective or something else to you; the genre alone does not distinguish these.';
  if (/dance|electronic|house|techno|disco/.test(g)) return 'You might be choosing rhythm and energy for movement, motivation or a lift in mood. You could also simply enjoy the sound. Does this fit your reason for listening?';
  if (/metal|rock|punk/.test(g)) return 'You might enjoy intensity, a sense of release or motivation. Listening to this genre does not mean you are angry or distressed. What does this particular track bring up for you?';
  if (/ambient|new age|classical/.test(g)) return 'You might be seeking focus, space to reflect or relaxation. Some music in this category is also intense or dramatic, so check how this particular recording feels to you.';
  if (/hip.hop|rap|r&b|soul/.test(g)) return 'You might connect with the rhythm, storytelling, confidence or emotional expression. The genre cannot tell us which emotion you are experiencing; your reason for choosing this track matters.';
  if (/jazz|blues|folk|country|singer.songwriter/.test(g)) return 'You might be drawn to storytelling, reflection, familiarity or the musical performance itself. A reflective song can feel comforting or joyful as well as sad.';
  if (/pop/.test(g)) return 'You might be looking for enjoyment, familiarity, connection or an energy boost. Pop also includes sad and reflective songs, so this is a conversation prompt rather than a mood reading.';
  return 'People listen to this genre for many reasons, including enjoyment, memories, focus or changing how they feel. What were you hoping to feel when you chose this song?';
}
function safeSource(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && ['music.apple.com','itunes.apple.com'].includes(u.hostname) ? u.href : ''; } catch { return ''; }
}
function createMusicSearch(fetcher = (...args) => fetch(...args)) {
  const cache = new Map(); let calls = [];
  return async function searchSongs(title, artist = '', country = 'IN') {
    const term = [title.trim(), artist.trim()].filter(Boolean).join(' ');
    const key = country + ':' + term.toLowerCase(); const now = Date.now();
    for (const [k,v] of cache) if (v.expires <= now) cache.delete(k);
    if (cache.has(key)) return cache.get(key).tracks;
    calls = calls.filter(t => t > now - 60000);
    if (calls.length >= 18) { const e = new Error('Search is busy. Please wait a minute and try again.'); e.status = 429; throw e; }
    calls.push(now);
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({term, country, media:'music', entity:'song', limit:'12'}).toString();
    let response, data;
    try {
      response = await fetcher(url, {signal: AbortSignal.timeout(10000), redirect: 'error', headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('Provider unavailable');
      data = await response.json();
      if (!Array.isArray(data.results)) throw new Error('Invalid provider response');
    } catch { const e = new Error('Online song search is temporarily unavailable. Check your internet connection and try again. No mood has been inferred.'); e.status = 503; throw e; }
    const seen = new Set();
    const tracks = data.results.filter(t => t.kind === 'song' && Number.isSafeInteger(t.trackId) && typeof t.trackName === 'string' && typeof t.artistName === 'string')
      .filter(t => { if (seen.has(t.trackId)) return false; seen.add(t.trackId); return true; })
      .map(t => ({id:String(t.trackId), title:t.trackName.slice(0,200), artist:t.artistName.slice(0,200), album:typeof t.collectionName === 'string' ? t.collectionName.slice(0,200) : '',
        genre:typeof t.primaryGenreName === 'string' ? t.primaryGenreName.slice(0,100) : '', sourceUrl:safeSource(t.trackViewUrl), provider:'Apple iTunes Search', country,
        retrievedAt:new Date().toISOString()}));
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(key, {tracks, expires:now + 10 * 60000});
    return tracks;
  };
}
const searchSongs = createMusicSearch();
module.exports = { moods, validText, genreReflection, createMusicSearch, searchSongs };
