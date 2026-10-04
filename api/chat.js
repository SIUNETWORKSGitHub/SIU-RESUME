import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Enforce CORS Security
  const allowedOrigins = [
    "https://siucloud.org",
    "https://www.siucloud.org",
    "https://siunetworksgithub.github.io",
    "http://localhost:3000"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin && origin.endsWith(".vercel.app")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key is missing on server." });
    }

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

    // 4. Initialize Gemini with gemini-2.5-flash / gemini-1.5-flash fallback
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    
    let responseText = "";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
      });
      const result = await model.generateContent(message);
      responseText = result.response.text();
    } catch (modelErr) {
      console.warn("Fallback to gemini-1.5-flash:", modelErr.message);
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const result = await fallbackModel.generateContent(`${systemInstruction}\n\nUser Question: ${message}`);
      responseText = result.response.text();
    }

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error("Gemini Bridge Detailed Error:", error);
    return res.status(500).json({ error: error.message || "Unable to process request." });
  }
}
