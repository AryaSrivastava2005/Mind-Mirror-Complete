const { questions, categoryDetails } = require("../questions");
function calculateResult(answers) {
  const categoryScores = {};

  Object.keys(categoryDetails).forEach((category) => {
    categoryScores[category] = 0;
  });

  let totalScore = 0;

  questions.forEach((question) => {
    const score = Number(answers[question.id]);
    totalScore += score;
    categoryScores[question.category] += score;
  });

  const highestCategory = Object.keys(categoryScores).reduce((highest, category) => {
    return categoryScores[category] > categoryScores[highest] ? category : highest;
  }, Object.keys(categoryScores)[0]);

  const resultProfiles = {
    thinking: {
      title: "Analytical Thinker",
      description: "You are strong in problem solving, planning, and logical thinking."
    },
    communication: {
      title: "Social Communicator",
      description: "You are strong in teamwork, speaking, and explaining ideas."
    },
    leadership: {
      title: "Natural Leader",
      description: "You are strong in responsibility, calm decision-making, and guiding others."
    },
    creativity: {
      title: "Creative Explorer",
      description: "You are strong in imagination, new ideas, and creative thinking."
    },
    adaptability: {
      title: "Flexible Achiever",
      description: "You are strong in adjusting to change, learning from feedback, and improving yourself."
    }
  };

  const topCategories = Object.keys(categoryScores).filter(key => categoryScores[key] === categoryScores[highestCategory]);
  let resultTitle = resultProfiles[highestCategory].title;
  let resultDescription = resultProfiles[highestCategory].description;

  if (topCategories.length > 1) {
    resultTitle = "Shared highest areas";
    resultDescription = "Your responses gave equal scores to: " + topCategories.map(key => categoryDetails[key].label).join(", ") + ".";
  }
  const maxScore = questions.length * 5;
  const totalPercent = Math.round((totalScore / maxScore) * 100);

  let level = "Moderate agreement";
  if (totalPercent >= 80) level = "Very high agreement";
  else if (totalPercent >= 65) level = "High agreement";
  else if (totalPercent >= 45) level = "Moderate agreement";
  else level = "Lower agreement";

  return {
    totalScore,
    maxScore,
    categoryScores,
    categoryDetails,
    highestCategory,
    topCategories,
    scoringVersion: 2,
    resultTitle,
    resultDescription,
    level
  };
}


function validateAnswers(body) {
  return body && questions.every(q => typeof body[q.id] === "string" && /^[1-5]$/.test(body[q.id]));
}
module.exports = { calculateResult, validateAnswers };
