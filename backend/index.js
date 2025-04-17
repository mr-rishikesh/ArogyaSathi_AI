import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3001;

// For __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const groq = new Groq({
  apiKey: "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",
});

app.post("/chat", upload.single("image"), async (req, res) => {
  const { message } = req.body;
  let imageData = "";

  // Convert image to base64 if available
  if (req.file) {
    const filePath = path.join(__dirname, req.file.path);
    imageData = fs.readFileSync(filePath, { encoding: "base64" });
    fs.unlinkSync(filePath); // Clean up
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: "You are a helpful mental health assistant.",
        },
        {
          role: "user",
          content: imageData
            ? `Here is an image (base64): ${imageData}. Question: ${message}`
            : message,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
