const questions = [
  {
    id: "q1",
    text: "I enjoy solving difficult problems.",
    category: "thinking"
  },
  {
    id: "q2",
    text: "I like planning before taking action.",
    category: "thinking"
  },
  {
    id: "q3",
    text: "I notice small details that others may miss.",
    category: "thinking"
  },
  {
    id: "q4",
    text: "I feel confident speaking with new people.",
    category: "communication"
  },
  {
    id: "q5",
    text: "I can clearly explain my thoughts to others.",
    category: "communication"
  },
  {
    id: "q6",
    text: "I enjoy working with a team.",
    category: "communication"
  },
  {
    id: "q7",
    text: "I stay calm when there is pressure.",
    category: "leadership"
  },
  {
    id: "q8",
    text: "People often come to me for guidance.",
    category: "leadership"
  },
  {
    id: "q9",
    text: "I like taking responsibility for important tasks.",
    category: "leadership"
  },
  {
    id: "q10",
    text: "I enjoy trying new ideas and creative methods.",
    category: "creativity"
  },
  {
    id: "q11",
    text: "I like designing or imagining new things.",
    category: "creativity"
  },
  {
    id: "q12",
    text: "I am comfortable doing things differently from others.",
    category: "creativity"
  },
  {
    id: "q13",
    text: "I adjust quickly when plans suddenly change.",
    category: "adaptability"
  },
  {
    id: "q14",
    text: "I can learn from mistakes without feeling stuck.",
    category: "adaptability"
  },
  {
    id: "q15",
    text: "I am open to feedback and use it to improve.",
    category: "adaptability"
  }
];

const categoryDetails = {
  thinking: {
    label: "Analytical thinking",
    shortLabel: "Thinking",
    description: "Problem solving, planning, and logical thinking"
  },
  communication: {
    label: "Communication",
    shortLabel: "Communication",
    description: "Speaking, teamwork, and expression"
  },
  leadership: {
    label: "Leadership",
    shortLabel: "Leadership",
    description: "Responsibility, guidance, and decision-making"
  },
  creativity: {
    label: "Creativity",
    shortLabel: "Creativity",
    description: "New ideas, imagination, and original thinking"
  },
  adaptability: {
    label: "Adaptability",
    shortLabel: "Adaptability",
    description: "Flexibility, learning from feedback, and handling change"
  }
};

const answerOptions = [
  { label: "Strongly Agree", value: 5 },
  { label: "Agree", value: 4 },
  { label: "Neutral", value: 3 },
  { label: "Disagree", value: 2 },
  { label: "Strongly Disagree", value: 1 }
];

module.exports = { questions, answerOptions, categoryDetails };
