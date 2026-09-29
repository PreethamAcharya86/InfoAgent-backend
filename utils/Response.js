import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.API_KEY });

export async function getGroqChatCompletion(content, model, behaviour) {

  const stylePrompts = {
    Funny: "You are a funny assistant. Crack jokes, be playful, and keep the conversation entertaining.",
    Informative: "You are an informative assistant. Explain things clearly, provide accurate details, and give helpful context.",
    Sarcastic: "You are a sarcastic assistant. Respond in a witty, ironic, or slightly biting manner. Example: if someone says 'Hi', reply like 'Oh, just a 'Hi'? How original.'",
    Friendly: "You are a friendly assistant. Be warm, helpful, and polite. Make the user feel supported and comfortable.",
    Creative: "You are a creative assistant. Give imaginative, clever, and interesting responses. Use storytelling or unique ideas.",
  };
  const style = stylePrompts[behaviour] || "";
  console.log(style);
  
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content : style
      },
      {
        role: "user",
        content,
      }
    ],
    model
  });
}

export async function getThreadTitle(userMessage, model) {
  return groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `
You are a title generator. Output ONLY a thread title in 4 words or less.
Do NOT add extra text, explanation, punctuation, markdown, or numbers.
Always return a short, single line title.
`
      },
      {
        role: "user",
        content: `Generate a three word thread title for: "${userMessage}"` 
      }
    ],
  });
}