const envPath = require('node:path').join(__dirname, '.env');
if (require('node:fs').existsSync(envPath)) process.loadEnvFile(envPath);
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const { questions, answerOptions, categoryDetails } = require("./questions");
const { readDatabase, writeDatabase, createId } = require("./utils/database");

const crypto = require("node:crypto");
const { calculateResult, validateAnswers } = require("./utils/scoring");
const { createChatService } = require("./utils/llm-chat");
const chatService = createChatService();
const { moods, searchSongs, genreReflection, validText } = require("./utils/music");
const { assessments, options: assessmentOptions, validate: validateAssessment, summarize } = require("./utils/assessments");
const motivationQuotes = require("./data/motivation.json");
const { describeReport } = require("./utils/assessment-guidance");
const basicTest = require("./utils/basic-psychological");
const leadershipTest = require("./utils/leadership-teamwork");
const sampleResults = require("./utils/sample-results");
const {types: musicTypes, musicInsights} = require("./utils/music-insights");
const app = express();
const production = process.env.NODE_ENV === "production";
if (production) throw new Error("This single-process prototype is for local/pilot use. Configure a production database and session store before public deployment.");
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});
const PORT = Number(process.env.PORT || 3000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 },
    resave: false,
    saveUninitialized: false
  })
);

// Synchronizer token protects all state-changing routes, including login and chat.
app.use((req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(32).toString("hex");
  res.locals.csrf = req.session.csrf;
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "POST" && (req.body._csrf || req.get("X-CSRF-Token")) !== req.session.csrf) {
    return res.status(403).send("Your session expired or the security token is missing. Reload the page and try again.");
  }
  next();
});
const attempts = new Map();
const cleanup = setInterval(() => { for (const [key, value] of attempts) if (value.until < Date.now()) attempts.delete(key); }, 60000);
cleanup.unref();
function authLimit(req, res, next) {
  const key = req.ip;
  let entry = attempts.get(key);
  if (!entry || entry.until < Date.now()) { entry = { count: 0, until: Date.now() + 15 * 60000 }; attempts.set(key, entry); }
  if (++entry.count > 20) return res.status(429).send("Too many account attempts. Try again in 15 minutes.");
  next();
}
function signIn(req, user, res) {
  req.session.regenerate(error => {
    if (error) return res.status(500).send("Unable to start session.");
    req.session.user = { id: user.id, name: user.name, username: user.username || user.email, email: user.email };
    req.session.save(error => error ? res.status(500).send("Unable to save session.") : res.redirect("/dashboard"));
  });
}
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.message = req.session.message || null;
  res.locals.currentPath = req.path;
  delete req.session.message;
  next();
});

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.message = "Please login first.";
    return res.redirect("/login");
  }
  next();
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", authLimit, asyncRoute(async (req, res) => {
  const { password } = req.body;
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const username = typeof req.body.username === "string" ? req.body.username.trim().toLowerCase() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!name || name.length > 100 || !/^[a-z0-9_]{3,30}$/.test(username) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== "string" || password.length < 8 || Buffer.byteLength(password) > 72) {
    req.session.message = "Use a name, valid email, a 3–30 character username (letters, numbers, underscore), and a password of at least 8 characters and at most 72 UTF-8 bytes.";
    return res.redirect("/register");
  }

  const db = readDatabase();
  const cleanUsername = username.trim().toLowerCase();

  const existingEmail = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    req.session.message = "This email is already registered. Please login.";
    return res.redirect("/login");
  }

  const existingUsername = db.users.find((user) => (user.username || "").toLowerCase() === cleanUsername);
  if (existingUsername) {
    req.session.message = "This username is already taken. Please choose another username.";
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  // Re-read after asynchronous hashing so overlapping registrations cannot overwrite each other.
  const latest = readDatabase();
  if (latest.users.some(u => u.username === cleanUsername || u.email.toLowerCase() === email)) {
    req.session.message = "Username or email already registered.";
    return res.redirect("/register");
  }

  const newUser = {
    id: createId("user"),
    name,
    username: cleanUsername,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  latest.users.push(newUser);
  writeDatabase(latest);

  signIn(req, newUser, res);
}));

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/login", authLimit, asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string" || username.length > 254 || Buffer.byteLength(password) > 72) {
    req.session.message = "Invalid username or password.";
    return res.redirect("/login");
  }

  const db = readDatabase();
  const cleanUsername = username.trim().toLowerCase();
  const user = db.users.find((item) => (item.username || item.email || "").toLowerCase() === cleanUsername);

  if (!user) {
    req.session.message = "Invalid username or password.";
    return res.redirect("/login");
  }

  const passwordMatched = await bcrypt.compare(password, user.password);

  if (!passwordMatched) {
    req.session.message = "Invalid username or password.";
    return res.redirect("/login");
  }

  signIn(req, user, res);
}));

app.post("/logout", (req, res) => {
  chatService.clear(req.sessionID);
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/dashboard", requireLogin, (req, res) => {
  const db = readDatabase();
  const userResults = db.results
    .filter((result) => result.userId === req.session.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const motivation = motivationQuotes[crypto.randomInt(motivationQuotes.length)];
  res.render("dashboard", { results: userResults, history: sampleResults.history(db, req.session.user.id), categoryDetails, motivation });
});

function saveSampleResult(req,res,type) {
 const db=readDatabase();
 const report={...sampleResults.build(type,req.body),id:createId('sample'),userId:req.session.user.id,createdAt:new Date().toISOString()};
 (db.sampleResults ||= []).push(report);writeDatabase(db);
 res.redirect('/sample-tests/result/'+report.id);
}
app.get('/sample-tests/result/:id',requireLogin,(req,res)=>{
 const report=(readDatabase().sampleResults||[]).find(r=>r.id===req.params.id && r.userId===req.session.user.id);
 if(!report)return res.status(404).send('Result not found.');
 res.render('sample-result',{report});
});
app.post('/sample-tests/result/:id/delete',requireLogin,(req,res)=>{
 const db=readDatabase();db.sampleResults=(db.sampleResults||[]).filter(r=>!(r.id===req.params.id && r.userId===req.session.user.id));
 writeDatabase(db);res.redirect('/dashboard');
});

app.get('/sample-tests', requireLogin, (req, res) => res.render('sample-tests'));
app.get('/sample-tests/basic-psychological', requireLogin, (req, res) => {
  res.render('basic-psychological', {questions: basicTest.questions, answers: {}, error: null});
});
app.post('/sample-tests/basic-psychological', requireLogin, (req, res) => {
  if (!basicTest.validate(req.body)) return res.status(400).render('basic-psychological', {
    questions: basicTest.questions, answers: req.body, error: 'Please answer all 15 statements using Agree or Disagree.'
  });
  saveSampleResult(req, res, 'basic-psychological');
});

app.get('/sample-tests/leadership-teamwork', requireLogin, (req, res) => {
  res.render('leadership-teamwork', {sections: leadershipTest.sections, answers: {}, error: null});
});
app.post('/sample-tests/leadership-teamwork', requireLogin, (req, res) => {
  if (!leadershipTest.validate(req.body)) return res.status(400).render('leadership-teamwork', {
    sections: leadershipTest.sections, answers: req.body, error: 'Please answer all 15 statements using Agree or Disagree.'
  });
  saveSampleResult(req, res, 'leadership-teamwork');
});

app.get("/questionnaire", requireLogin, (req, res) => {
  res.render("questionnaire", { questions, answerOptions, answers: {} });
});

app.post("/questionnaire", requireLogin, (req, res) => {
  if (!validateAnswers(req.body)) {
    return res.status(400).render("questionnaire", { questions, answerOptions, message: "Please answer all 15 questions using the available options.", answers: req.body });
  }
  const answers = Object.fromEntries(questions.map(q => [q.id, req.body[q.id]]));
  const calculatedResult = calculateResult(answers);

  const db = readDatabase();

  const savedResult = {
    id: createId("result"),
    userId: req.session.user.id,
    answers,
    ...calculatedResult,
    createdAt: new Date().toISOString()
  };

  db.results.push(savedResult);
  writeDatabase(db);

  res.redirect(`/result/${savedResult.id}`);
});

app.get("/result/:id", requireLogin, (req, res) => {
  const db = readDatabase();
  const result = db.results.find(
    (item) => item.id === req.params.id && item.userId === req.session.user.id
  );

  if (!result) {
    req.session.message = "Result not found.";
    return res.redirect("/dashboard");
  }

  res.render("result", { result, categoryDetails });
});



function renderMusic(req, res, extra = {}) {
  const db = readDatabase();
  const history = (db.musicEntries || []).filter(e => e.userId === req.session.user.id).slice().reverse().slice(0, 30);
  res.render('music', { moods, musicTypes, insights:null, history, song: '', artist: '', country:'IN', matches: null, selected:null, reflection:'', error: null, ...extra });
}
function selectedTrack(req) {
  const search = req.session.musicSearch;
  if (!search || Date.now() - search.createdAt > 30 * 60000 || req.body.searchId !== search.id) return null;
  return search.tracks.find(t => t.id === req.body.trackId) || null;
}
app.get('/music', requireLogin, (req, res) => renderMusic(req, res));
app.post('/music/analyse', requireLogin, asyncRoute(async (req, res) => {
  const { song, artist = '', country = 'IN' } = req.body;
  if (!validText(song, 160, true) || !validText(artist, 160) || !['IN','US','GB'].includes(country)) {
    res.status(400); return renderMusic(req, res, { error: 'Enter a song name of 1–160 characters, an optional artist and a supported search region.' });
  }
  delete req.session.musicSearch;
  try {
    const tracks = await searchSongs(song, artist, country);
    const searchId = createId('search');
    req.session.musicSearch = { id:searchId, createdAt:Date.now(), tracks };
    renderMusic(req, res, { song, artist, country, matches:tracks, searchId });
  } catch (error) {
    res.status(error.status || 503); renderMusic(req, res, {song, artist, country, error:error.message});
  }
}));
app.post('/music/select', requireLogin, (req, res) => {
  const selected = selectedTrack(req);
  if (!selected) { res.status(400); return renderMusic(req, res, {error:'Please search again and select a recording from the latest results. Search selections expire after 30 minutes.'}); }
  const type=typeof req.body.trackType === 'string' ? req.body.trackType : 'unspecified';
  if(!Object.hasOwn(musicTypes,type))return res.status(400).send('Choose a listed track type.');
  renderMusic(req, res, {selected, insights:musicInsights(selected.genre,type), reflection:genreReflection(selected.genre), searchId:req.session.musicSearch.id});
});
app.post('/music/save', requireLogin, (req, res) => {
  const track = selectedTrack(req);
  if (!track || !moods.includes(req.body.mood) || req.body.consent !== 'yes' || (req.body.trackType !== undefined && !Object.hasOwn(musicTypes,req.body.trackType))) {
    res.status(400); return renderMusic(req, res, { error: 'Select a current search result, choose your feeling and confirm saving.' });
  }
  const db = readDatabase();
  if (!db.musicEntries) db.musicEntries = [];
  db.musicEntries.push({ id:createId('music'), userId:req.session.user.id, song:track.title, artist:track.artist, genre:track.genre,
    provider:track.provider, sourceUrl:track.sourceUrl, retrievedAt:track.retrievedAt, country:track.country,
    trackType:req.body.trackType || 'unspecified', insights:musicInsights(track.genre,req.body.trackType), reflection:genreReflection(track.genre), reportedMood:req.body.mood, createdAt:new Date().toISOString() });
  writeDatabase(db); req.session.message = 'Music check-in saved.'; res.redirect('/music');
});
app.post('/music/:id/delete', requireLogin, (req, res) => {
  const db = readDatabase();
  db.musicEntries = (db.musicEntries || []).filter(e => !(e.id === req.params.id && e.userId === req.session.user.id));
  writeDatabase(db); res.redirect('/music');
});

function chatLogin(req,res,next) {
 if(!req.session.user)return res.status(401).json({error:'Please sign in to use the chat.'});
 next();
}
app.get('/chatbot/history',chatLogin,(req,res)=>res.json(chatService.state(req.sessionID)));
app.post('/chatbot/reset',chatLogin,(req,res)=>{
 if(!chatService.clear(req.sessionID))return res.status(409).json({error:'Wait for the current reply before starting a new chat.'});
 res.json({ok:true});
});
app.post('/chatbot',chatLogin,asyncRoute(async(req,res)=>{
 if(typeof req.body.message!=='string' || !req.body.message.trim() || req.body.message.length>2000)return res.status(400).json({error:'Enter a message between 1 and 2,000 characters.'});
 const result=await chatService.reply(req.sessionID,req.session.user.id,req.body.message.trim());
 res.status(result.status).json(result);
}));

app.get('/assessments', requireLogin, (req,res) => {
  const reports = (readDatabase().assessmentResults || []).filter(r=>r.userId===req.session.user.id).reverse();
  res.render('assessments', {assessments, reports});
});
app.get('/assessments/result/:id', requireLogin, (req,res) => {
  const report = (readDatabase().assessmentResults || []).find(r=>r.id===req.params.id && r.userId===req.session.user.id);
  if (!report) return res.status(404).send('Report not found.');
  res.render('assessment-result', {report,saved:true, insights:describeReport(report)});
});
app.post('/assessments/result/:id/delete', requireLogin, (req,res) => {
  const db=readDatabase();
  db.assessmentResults=(db.assessmentResults || []).filter(r=>!(r.id===req.params.id && r.userId===req.session.user.id));
  writeDatabase(db);res.redirect('/assessments');
});
app.get('/assessments/:type', requireLogin, (req,res) => {
  const config=Object.hasOwn(assessments,req.params.type) ? assessments[req.params.type] : null;
  if(!config)return res.status(404).send('Assessment not found.');
  res.render('assessment-form',{config,options:assessmentOptions,answers:{},error:null});
});
app.post('/assessments/:type', requireLogin, (req,res) => {
  const config=Object.hasOwn(assessments,req.params.type) ? assessments[req.params.type] : null;
  if(!config)return res.status(404).send('Assessment not found.');
  if(!validateAssessment(config,req.body)) return res.status(400).render('assessment-form',{config,options:assessmentOptions,answers:req.body,error:'Please confirm the two opening statements and select an answer for every item.'});
  const report={...summarize(config,req.body), createdAt:new Date().toISOString()};
  {
    const db=readDatabase(); if(!db.assessmentResults) db.assessmentResults=[];
    report.id=createId('assessment');report.userId=req.session.user.id;
    db.assessmentResults.push(report);writeDatabase(db);
    return res.redirect('/assessments/result/'+report.id);
  }

});

app.use((req, res) => res.status(404).send("Page not found. Return to the home page."));
app.use((error, req, res, next) => {
  console.error("Request failed:", error.name);
  res.status(error.status === 413 ? 413 : 500).send("Unable to complete this request. Please try again.");
});
if (require.main === module) app.listen(PORT, process.env.HOST || "127.0.0.1", () => console.log(`Mind Mirror: http://localhost:${PORT}`));
module.exports = app;
