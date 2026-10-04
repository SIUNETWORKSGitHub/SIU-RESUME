import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Enforce CORS Security
  const allowedOrigins = ["https://siucloud.org", "http://localhost:3000"];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight browser check
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid request payload." });
    }

    // 2. Retrieve GEMINI_API_KEY securely from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key is missing on the server." });
    }

    // 3. System Context & Instructions
    const systemInstruction = `
      You are the official public AI Virtual Assistant for SiuCloud (siucloud.org).
      Tagline: "Your Cloud, Simplified."
      Mission: Practical, results-first cloud advisory for Small to Medium Businesses (SMBs).
      Core Pillars:
      1. Cloud Advisory: Hybrid strategy across Azure, AWS, and VMware.
      2. Cost Optimization: FinOps strategies and cloud spend reduction.
      3. Security & Governance: Enterprise-grade security guardrails and compliance.
      
      Instruction: Answer visitor queries briefly and politely. If visitors request a formal consultation, guide them to use the "Schedule Consultation Form" on the site or call 305 440 9192.
    `;

    // 4. Connect to Gemini 1.5 Flash Model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Gemini Bridge Error:", error);
    return res.status(500).json({ error: "Unable to process request at this time." });
  }
}
