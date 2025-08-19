import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json(); // 🔹 now matches AIResponse.js

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are LIFE, a powerful personal assistant AI. Always answer clearly, confidently, and with purpose.",
          },
          { role: "user", content: prompt }, // 🔹 now works
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("No AI response returned.");
    }

    return NextResponse.json({ answer: data.choices[0].message.content }); // 🔹 return "answer"
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ answer: "⚠️ LIFE ran into an error." });
  }
}
