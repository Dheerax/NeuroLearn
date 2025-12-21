// Gemini AI Service for NeuroLearn
// This service provides AI-powered features for neurodivergent users

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  "AIzaSyAIQOAMNuYtVTtEUbxtR2bb1tBuyFjS2RE";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent";

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  companion: `You are NeuroLearn Companion, a supportive AI assistant designed specifically for neurodivergent individuals (ADHD, Autism, etc.). 

Your personality:
- Warm, patient, and non-judgmental
- Clear and direct communication (avoid ambiguity)
- Break down complex topics into simple steps
- Use emojis occasionally for warmth 💙
- Validate feelings and experiences
- Offer practical, actionable advice
- Remember that executive dysfunction is real

Communication style:
- Keep responses concise (2-3 paragraphs max unless asked for more)
- Use bullet points and numbered lists when helpful
- Avoid overwhelming with too much information
- Ask clarifying questions if needed
- Celebrate small wins enthusiastically

You can help with:
- Task breakdown and planning
- Focus strategies and techniques  
- Emotional support and validation
- Learning new concepts
- Social skills coaching
- Time management
- Dealing with overwhelm`,

  taskBreakdown: `You are a task breakdown specialist for neurodivergent individuals. 
When given a task, break it down into small, manageable steps (5-15 minutes each).
Each step should be:
- Specific and actionable
- Not overwhelming
- In a logical order
Respond ONLY with a JSON array of subtask titles, nothing else.
Example: ["Research topic online", "Take notes on key points", "Create outline", "Write first draft"]`,

  learning: `You are an expert educational assistant for neurodivergent learners (ADHD, Autism, etc.).

Your teaching approach:
- Provide COMPREHENSIVE explanations - be thorough and detailed
- Use multiple modalities (text, examples, real-world analogies)
- Break content into clear, organized sections with headers
- Use bullet points and numbered lists extensively
- Include visual descriptions and metaphors
- Give concrete examples that relate to everyday life
- Cover the topic fully - don't just introduce, actually TEACH the content
- End with a simple check question

IMPORTANT: Always provide a COMPLETE, DETAILED explanation. Never just acknowledge the topic - actually explain it thoroughly with all the sections requested. Your response should be educational and substantive.`,

  social: `You are a social skills coach for neurodivergent individuals.
Help with:
- Understanding social cues and norms
- Practicing conversations
- Handling social anxiety
- Setting boundaries
- Making and maintaining friendships
Be non-judgmental and provide specific, practical advice.`,
};

// Main chat function
export async function chat(
  message,
  context = "companion",
  conversationHistory = []
) {
  const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.companion;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [
        {
          text: "I understand. I'm here to help as a supportive companion for neurodivergent individuals. How can I assist you today?",
        },
      ],
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      throw new Error(error.error?.message || "Failed to get response");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from AI");
    }

    return { success: true, message: text };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      success: false,
      message:
        "I'm having trouble connecting right now. Please try again in a moment. 💙",
    };
  }
}

// Break down a task into subtasks
export async function breakdownTask(taskTitle) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPTS.taskBreakdown }],
          },
          {
            role: "model",
            parts: [
              {
                text: "I'll break down tasks into manageable steps. Give me a task to break down.",
              },
            ],
          },
          {
            role: "user",
            parts: [{ text: `Break down this task: "${taskTitle}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const subtasks = JSON.parse(jsonMatch[0]);
      return subtasks.map((title) => ({ title, completed: false }));
    }

    // Fallback: split by newlines if not proper JSON
    const lines = text
      .split("\n")
      .filter(
        (line) => line.trim() && !line.startsWith("[") && !line.startsWith("]")
      );
    return lines.slice(0, 6).map((line) => ({
      title: line.replace(/^[\d\-\*\.]+\s*/, "").trim(),
      completed: false,
    }));
  } catch (error) {
    console.error("Task breakdown error:", error);
    // Return generic subtasks as fallback
    return [
      { title: `Research: ${taskTitle}`, completed: false },
      { title: "Gather materials/resources", completed: false },
      { title: "Create a plan/outline", completed: false },
      { title: "Complete first part", completed: false },
      { title: "Review and finalize", completed: false },
    ];
  }
}

// Get personalized tips based on user state
export async function getPersonalizedTip(userState) {
  const { energyLevel, currentStreak, recentTasks, timeOfDay } = userState;

  const prompt = `Given this user state:
- Energy level: ${energyLevel || "medium"}
- Task streak: ${currentStreak || 0} tasks completed today
- Time: ${timeOfDay || "afternoon"}
- Recent tasks: ${
    recentTasks
      ?.slice(0, 3)
      .map((t) => t.title)
      .join(", ") || "none"
  }

Provide ONE short, encouraging productivity tip (1-2 sentences max) that's appropriate for a neurodivergent individual. Be warm and supportive.`;

  return chat(prompt, "companion");
}

// Generate study/learning content
export async function generateLearningContent(topic, userLevel = "beginner") {
  const prompt = `Explain "${topic}" for a ${userLevel} learner who may have ADHD or autism.
Format:
1. Quick summary (2-3 sentences)
2. Key points (bullet list, max 5)
3. A simple analogy or example
4. One practice question

Keep it engaging and not overwhelming.`;

  return chat(prompt, "learning");
}

// Social skills practice scenarios
export async function generateSocialScenario(situation) {
  const prompt = `Create a practice scenario for: "${situation}"
Include:
1. The situation setup (brief)
2. What the other person might say
3. 2-3 possible responses with explanations of when each might be appropriate
4. Tips for reading the social situation

Keep it practical and supportive.`;

  return chat(prompt, "social");
}

// ============ LEARNING FUNCTIONS ============

// Explain a topic in neurodivergent-friendly way
export async function explainTopic(
  topic,
  style = "visual",
  level = "beginner"
) {
  const styleGuide = {
    visual:
      "Use descriptive imagery, diagrams descriptions, and visual metaphors. Describe things as if painting a picture.",
    audio:
      "Use rhythm, repetition, and conversational tone. As if explaining in a podcast.",
    text: "Use clear bullet points, numbered lists, and structured format.",
    mixed: "Combine visuals, examples, and clear structure.",
  };

  const prompt = `Explain "${topic}" for a ${level} learner who may be neurodivergent (ADHD/Autism).

Learning style preference: ${style}
Style guide: ${styleGuide[style] || styleGuide.mixed}

Format your response as:
## 🎯 Quick Summary
(2-3 sentences, the core concept)

## 📚 Key Points
(Bullet list, max 5 points, each 1-2 sentences)

## 💡 Simple Analogy
(Relate to everyday experience)

## 🔍 Example in Action
(Real-world application)

## ❓ Check Your Understanding
(One simple question to test comprehension)

Keep it engaging, not overwhelming. Use emojis sparingly for visual breaks.`;

  return chat(prompt, "learning");
}

// Generate flashcards from a topic
export async function generateFlashcards(topic, count = 5) {
  const prompt = `Create ${count} flashcards about "${topic}" for a neurodivergent learner.

Return ONLY a JSON array in this exact format:
[
  {"front": "Question or concept", "back": "Answer or explanation (keep brief)", "hint": "Optional hint"},
  ...
]

Rules:
- Keep answers SHORT (1-2 sentences max)
- Make questions specific and clear
- Include a helpful hint for each
- Progress from basic to slightly more advanced`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse flashcards");
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return [
      {
        front: `What is ${topic}?`,
        back: "Try asking the AI Tutor!",
        hint: "Think about the basics",
      },
    ];
  }
}

// Generate a quiz from a topic
export async function generateQuiz(topic, questionCount = 5) {
  const prompt = `Create a ${questionCount}-question quiz about "${topic}" for a neurodivergent learner.

Return ONLY a JSON array in this exact format:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct"
  },
  ...
]

Rules:
- Clear, unambiguous questions
- No trick questions
- Helpful explanations
- Mix of easy and medium difficulty`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse quiz");
  } catch (error) {
    console.error("Quiz generation error:", error);
    return [];
  }
}

// ============ SOCIAL SKILLS FUNCTIONS ============

// Practice a conversation with AI
export async function practiceConversation(
  scenario,
  userMessage,
  history = []
) {
  const systemPrompt = `You are playing a character in a social skills practice scenario.
Scenario: ${scenario}

Your role:
- Respond naturally as the other person in the scenario would
- Keep responses brief (1-3 sentences)
- Be realistic but not harsh
- After your response, add a line break and "[COACH TIP]:" followed by brief feedback on how the user did

Example format:
"[Character's response here]

[COACH TIP]: Great job being direct! Next time, you could also try..."`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [
        {
          text: "I understand. I'll play my role in the scenario and provide coaching tips. Let's begin!",
        },
      ],
    },
    ...history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Split response and coaching tip
    const parts = text.split("[COACH TIP]:");
    return {
      response: parts[0]?.trim() || text,
      coachTip: parts[1]?.trim() || null,
    };
  } catch (error) {
    console.error("Conversation practice error:", error);
    return {
      response: "I'm having trouble responding right now. Let's try again!",
      coachTip: null,
    };
  }
}

// Analyze emotions in a scenario
export async function analyzeEmotion(context) {
  const prompt = `Given this social context, identify the likely emotions:

"${context}"

Return a JSON object:
{
  "primaryEmotion": "The main emotion (one word)",
  "confidence": "high/medium/low",
  "cues": ["List", "of", "clues", "that indicate this emotion"],
  "explanation": "Brief explanation of why this emotion makes sense",
  "possibleResponses": ["How you might respond appropriately"]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse emotion analysis");
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return null;
  }
}

// Generate a social script for a situation
export async function generateSocialScript(situation, customizations = {}) {
  const { tone = "friendly", context = "general" } = customizations;

  const prompt = `Create a social script for: "${situation}"

Tone: ${tone}
Context: ${context}

Format as:
## Starting the Conversation
[What to say first]

## Key Phrases to Use
- Phrase 1
- Phrase 2
- Phrase 3

## If They Say... You Could Say...
| Their Response | Your Response |

## Ending the Conversation
[How to wrap up politely]

## Body Language Tips
- Tip 1
- Tip 2

Keep it practical and memorizable.`;

  return chat(prompt, "social");
}

// Generate daily social challenge
export async function getDailySocialChallenge(difficulty = "beginner") {
  const prompt = `Create a small, achievable social skills challenge for today.
Difficulty: ${difficulty}

Format:
{
  "title": "Challenge name",
  "description": "What to do (1-2 sentences)",
  "tips": ["Tip 1", "Tip 2"],
  "xpReward": 25,
  "category": "greeting/conversation/boundary/other"
}

Make it specific and achievable. Not too overwhelming.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 256 },
      }),
    });

    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse challenge");
  } catch (error) {
    console.error("Challenge generation error:", error);
    return {
      title: "Say Hi",
      description: "Greet one person today with a smile and 'hello'",
      tips: ["Make brief eye contact", "Keep it short and simple"],
      xpReward: 20,
      category: "greeting",
    };
  }
}

export default {
  chat,
  breakdownTask,
  getPersonalizedTip,
  generateLearningContent,
  generateSocialScenario,
  // Learning functions
  explainTopic,
  generateFlashcards,
  generateQuiz,
  // Social functions
  practiceConversation,
  analyzeEmotion,
  generateSocialScript,
  getDailySocialChallenge,
  SYSTEM_PROMPTS,
};
