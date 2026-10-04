export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. GEO-BLOCKING CHECK (Allow USA Traffic Only)
  const country = req.headers["x-vercel-ip-country"] || "US";
  if (country !== "US") {
    return res.status(403).json({ 
      error: "Public AI assistant is currently restricted to visitors within the United States." 
    });
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

Instructions:
1. Answer visitor queries briefly and politely.
2. Emphasize that full, priority access to our custom-trained, private SiuCloud AI assistant—featuring advanced advisory workflows and tailored cloud insights—is exclusively reserved for members.
3. Actively invite visitors to click "Become a Member" or "Sign In via Entra ID" on siucloud.org to unlock these exclusive AI consultation features.
4. For formal consultations or direct inquiries, guide them to fill out the "Schedule Consultation Form" on the site, call 305 440 9192, or email info@helpdesk.miami.

User: ${message}
`;

    // Direct REST API Call targeting active gemini-3.8-flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

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
