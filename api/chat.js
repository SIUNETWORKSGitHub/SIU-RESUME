export default async function handler(req, res) {
  // 1. CORS Headers
  const allowedOrigins = [
    "https://siucloud.org",
    "https://www.siucloud.org",
    "https://siunetworksgithub.github.io",
    "http://localhost:3000"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin) || (origin && origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
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

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ error: "API key missing on server." });
    }

    const promptText = `
You are the official public AI Virtual Assistant for SiuCloud (siucloud.org).
Tagline: "Your Cloud, Simplified."
Mission: Practical, results-first cloud advisory for Small to Medium Businesses (SMBs).
Core Pillars: Cloud Advisory, Cost Optimization (FinOps), Security & Governance.
Instruction: Answer visitor queries briefly and politely. For formal consultations, guide them to use the "Schedule Consultation Form" on the site or call 305 440 9192.

User: ${message}
`;

    // 2. Direct REST API Call to Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Raw Error:", JSON.stringify(data));
      return res.status(response.status).json({ 
        error: data.error?.message || "Google API returned an error." 
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text returned.";
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Serverless Catch Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
}
