function getChatbotReply(message) {
  const text = String(message || "").toLowerCase();

  if (/suicid|kill myself|hurt myself|self.harm|end my life/.test(text)) {
    return "I am an automated website guide and cannot provide emergency support. If you may act on these thoughts or are in immediate danger, contact local emergency services now and ask someone you trust to stay with you. Please seek support from a qualified mental-health professional.";
  }
  if (!text.trim()) {
    return "Please type a question. I can help with website use, result meaning, stress tips, or calming suggestions.";
  }

  if (/\buse\b/.test(text) || text.includes("website") || text.includes("start") || text.includes("questionnaire")) {
    return "Create an account, then choose a test from Tests or Sample Tests in the sidebar. Completed test results appear on your dashboard. Which test would you like to explore?";
  }

  if (text.includes("result") || text.includes("score") || text.includes("level")) {
    return "Your result is created from category-wise scores. The system converts each answer into points, compares the totals, and shows agreement scores and your highest-scoring areas. These are reflection prompts, not a diagnosis or an objective ability test.";
  }

  if (text.includes("stress") || text.includes("pressure") || text.includes("overthinking")) {
    return "It sounds like there may be a lot on your mind. You could pause and write down one manageable next step. What feels most pressing right now?";
  }

  if (text.includes("anger") || text.includes("aggression") || text.includes("irritated") || text.includes("calm")) {
    return "When anger rises, pause before reacting. Drink water, step away for a minute, name the feeling, and respond only after your body feels calmer.";
  }

  if (text.includes("privacy") || text.includes("safe") || text.includes("data")) {
    return "In this sample project, your account and results are stored locally in a JSON file for testing. In a real version, this should be moved to a secure database with encryption and privacy controls.";
  }

  if (text.includes("dark") || text.includes("theme")) {
    return "Use the Dark Mode button in the navigation bar. The website remembers your choice in the browser.";
  }

  return "I can help with Mind Mirror features, result explanation, stress relief ideas, calming techniques, dashboard use, and privacy basics. Try asking: How is my result calculated?";
}

module.exports = { getChatbotReply };
