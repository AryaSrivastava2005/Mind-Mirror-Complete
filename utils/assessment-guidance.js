// General self-care examples, not clinical recommendations or validated scoring.
const guidance = {
 stress: [
  ['This area explores how tasks, deadlines and interruptions fit into your day.', 'When a last-minute request arrives', 'Pause before accepting. Ask which task takes priority and whether the deadline can move.', 'Write down one next step for your most important task and leave space for a short break.'],
  ['This area explores recurring worry and how you respond to uncertainty.', 'When you keep checking for an important reply', 'Choose a time to check again. Return to one small task you can influence while you wait.', 'Notice the worry, then gently bring attention to what you can see and feel around you.'],
  ['This area explores physical discomfort alongside pressure. These answers cannot establish what causes a physical symptom.', 'When you notice tension during a demanding task', 'Pause, loosen your shoulders if comfortable, and breathe gently without forcing or holding your breath.', 'Try a short comfortable walk or a change of position. Seek medical advice for persistent, new or concerning symptoms.'],
  ['This area explores whether responsibilities leave enough room for rest.', 'When work follows you into bedtime', 'Write tomorrow’s first task down and set a stopping point for messages tonight.', 'Try a regular sleep schedule and a quiet wind-down activity you enjoy.'],
  ['This area explores pressure from requests, expectations and difficulty expressing limits.', 'When someone asks for more than you can manage', 'Try: “I can help with this tomorrow, but I cannot take it on today.” Adapt this to what feels safe in your situation.', 'Ask a trusted person for one specific form of practical help.'],
  ['This area explores how easy it feels to choose a next step when pressure builds.', 'When a task feels too large', 'Split it into one small action, such as opening the document or listing what you need. Begin there.', 'Review what can wait or be shared. A manageable plan includes rest as well as tasks.']
 ],
 'mental-health': [
  ['This area explores enjoyment, emotional distance and low mood in everyday life.', 'When a favourite activity feels hard to start', 'Try a small, low-pressure version, such as a few minutes of music or time outdoors. You do not have to force yourself to feel happy.', 'Let a trusted person know how you are doing. Persistent loss of interest or low mood is worth discussing with a professional.'],
  ['This area explores worry, reassurance-seeking and feeling unsettled.', 'When an unclear message triggers worry', 'Separate what the message actually says from what you are imagining. Ask for clarification if appropriate.', 'Take a gentle pause before responding; focus on your surroundings or a relaxing activity that suits you.'],
  ['This area explores sleep patterns, tiredness and available energy. It does not identify the cause of fatigue.', 'When tiredness makes starting the day difficult', 'Choose one manageable first step and keep meals and wake-up times as regular as practical.', 'Reduce screens before bed and make room for rest. Discuss ongoing sleep or energy difficulties with a health-care professional.'],
  ['This area explores loneliness, connection and how easy it feels to reach out.', 'When you want company but do not know how to ask', 'Send a simple message to someone you trust: “Could we talk or take a short walk this week?”', 'Choose a comfortable way to connect. A short conversation can be enough for today.'],
  ['This area explores self-critical thoughts and handling strong emotions.', 'When a small mistake leads to harsh self-judgment', 'Describe the specific mistake without labelling your whole self. Consider what you would say to a friend in the same situation.', 'Name the feeling, pause, and choose one kind, practical next action.'],
  ['This area explores how emotional difficulties affect everyday tasks and care.', 'When routine tasks feel difficult to begin', 'Choose one essential task, break it into a small step, and ask someone you trust for practical help if needed.', 'If eating, personal care, work or study become hard to manage, seek professional support; you do not need to wait for a worse result.']
 ]
};
function describeReport(report) {
 const config = require('../data/assessments.json')[report.assessmentId];
 return report.sections.map(s => {
  const index=config?.sections.findIndex(c=>c.title===s.title) ?? -1;
  const g=guidance[report.assessmentId]?.[index] || ['This area summarises the experiences you report.', 'When you need a next step', 'Choose one manageable action and ask for support if you need it.', 'Make room for rest and connection.'];
  const frequent=s.counts[3]+s.counts[4];
  let description = s.answered === 0 ? 'You skipped this area, so there is not enough information to describe your experience.' : `${frequent} of your ${s.answered} answered items are marked Often or Almost always. ` + (frequent ? 'Choose an experience in this area that matters to you and try one small step below.' : 'None are marked Often or Almost always. You can still use these ideas if this area feels difficult.');
  if(s.skipped && s.answered) description += ' This is a partial picture because some items are skipped.';
  return {...s, frequentCount:frequent, context:g[0],description,situation:g[1],tips:g.slice(2)};
 });
}
module.exports={describeReport};
