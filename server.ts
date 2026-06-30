import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Simple log wrapper to write console logs to a file for container debugging
const logFile = "./server_debug.log";
try {
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }
} catch (e) {}

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  try {
    fs.appendFileSync(logFile, `[LOG] ${args.map(a => typeof a === "object" ? JSON.stringify(a) : a).join(" ")}\n`);
  } catch (e) {}
};

console.error = (...args) => {
  originalError(...args);
  try {
    fs.appendFileSync(logFile, `[ERR] ${args.map(a => typeof a === "object" ? JSON.stringify(a) : a).join(" ")}\n`);
  } catch (e) {}
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple native .env loader to populate process.env with real credentials
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const firstEq = trimmed.indexOf("=");
      if (firstEq === -1) continue;
      const key = trimmed.substring(0, firstEq).trim();
      let val = trimmed.substring(firstEq + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
    console.log("[Env] Successfully loaded .env file natively.");
  }
} catch (e) {
  console.error("[Env] Error loading .env file:", e);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Configure body parsers with generous limits for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure API Proxy for Chat / Structural Analysis
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, format } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // 1. Google Gemini Native API handling (Primary & Robust)
      console.log(`[Proxy] Checking for GEMINI_API_KEY. Present: ${!!process.env.GEMINI_API_KEY}, Length: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0}, Value: "${process.env.GEMINI_API_KEY}"`);
      if (process.env.GEMINI_API_KEY) {
        console.log("[Proxy] Processing request using native Google Gemini API.");
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          let systemInstruction = "";
          const contents: any[] = [];

          for (const msg of messages) {
            if (msg.role === "system") {
              systemInstruction = msg.content;
              continue;
            }

            const role = msg.role === "assistant" ? "model" : "user";
            const parts: any[] = [];

            if (msg.content) {
              parts.push({ text: msg.content });
            }

            if (msg.images && Array.isArray(msg.images)) {
              for (const img of msg.images) {
                let cleanBase64 = img;
                let mimeType = "image/jpeg";
                if (img.startsWith("data:")) {
                  const match = img.match(/^data:([^;]+);base64,(.*)$/);
                  if (match) {
                    mimeType = match[1];
                    cleanBase64 = match[2];
                  }
                }
                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: cleanBase64,
                  },
                });
              }
            }

            contents.push({ role, parts });
          }

          const config: any = {};
          if (systemInstruction) {
            config.systemInstruction = systemInstruction;
          }

          if (format) {
            config.responseMimeType = "application/json";
            const convertSchemaTypes = (schema: any): any => {
              if (!schema || typeof schema !== "object") return schema;
              const result = { ...schema };
              if (typeof result.type === "string") {
                result.type = result.type.toUpperCase();
              }
              if (result.properties) {
                const newProps: any = {};
                for (const [key, val] of Object.entries(result.properties)) {
                  newProps[key] = convertSchemaTypes(val);
                }
                result.properties = newProps;
              }
              if (result.items) {
                result.items = convertSchemaTypes(result.items);
              }
              return result;
            };
            config.responseSchema = convertSchemaTypes(format);
          }

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents,
            config,
          });

          const content = response.text || "";
          return res.json({
            message: {
              role: "assistant",
              content: content,
            },
          });
        } catch (geminiErr: any) {
          console.error("[Proxy] Gemini API error, falling back to Ollama/SiliconFlow:", geminiErr);
          // Fall through to Ollama/SiliconFlow below
        }
      }

      // 2. Ollama / SiliconFlow Fallback Engine
      // Retrieve backend API Key and Base URL securely
      const apiKey =
        process.env.OLLAMA_API_KEY ||
        process.env.API_KEY ||
        "";

      let cleanApiKey = apiKey.trim();
      if (cleanApiKey.startsWith("Bearer ")) {
        cleanApiKey = cleanApiKey.replace(/^Bearer\s+/, "");
      }

      let baseUrl =
        process.env.OLLAMA_BASE_URL ||
        process.env.OLLAMA_HOST ||
        "";

      // Normalize baseUrl: remove trailing slashes
      baseUrl = baseUrl.trim().replace(/\/+$/, "");

      // Strip redundant paths that users often mistakenly append
      if (baseUrl.endsWith("/chat/completions")) {
        baseUrl = baseUrl.substring(0, baseUrl.length - "/chat/completions".length);
      }
      if (baseUrl.endsWith("/api/chat")) {
        baseUrl = baseUrl.substring(0, baseUrl.length - "/api/chat".length);
      }
      // Re-remove trailing slashes after strip
      baseUrl = baseUrl.replace(/\/+$/, "");

      console.log(`[Proxy] Using base URL: ${baseUrl}, API key present: ${!!apiKey}`);

      if (!baseUrl) {
        return res.status(400).json({ error: "OLLAMA_BASE_URL is not configured. Set it in your Vercel environment variables or .env file." });
      }
      if (!apiKey) {
        return res.status(400).json({ error: "OLLAMA_API_KEY is not configured. Set it in your Vercel environment variables or .env file." });
      }

      // SiliconFlow automatic /v1 path prefixing
      if ((baseUrl.includes("siliconflow.cn") || baseUrl.includes("siliconflow.com")) && !baseUrl.includes("/v1")) {
        baseUrl = `${baseUrl}/v1`;
      }

      // Detect if this is an image-based request (multimodal)
      const hasImages = messages.some(
        (m: any) => m.images && Array.isArray(m.images) && m.images.length > 0
      );

      const isOllamaLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1") || baseUrl.includes("11434");

      // Determine model based on capability and endpoint
      let targetModel = "minimax/Minimax-Text-01"; // Default MiniMax M3 on SiliconFlow

      if (baseUrl.includes("siliconflow")) {
        if (hasImages) {
          // Use SiliconFlow's powerful vision model for images
          targetModel = "Qwen/Qwen2-VL-7B-Instruct";
        } else {
          // Use MiniMax M3 for text tasks
          targetModel = "minimax/Minimax-Text-01";
        }
      } else if (isOllamaLocal) {
        if (hasImages) {
          // Local Ollama vision standard model (llama3.2-vision or llava are widely used)
          targetModel = process.env.OLLAMA_VISION_MODEL || "llama3.2-vision";
        } else {
          // Local Ollama text standard model
          targetModel = process.env.OLLAMA_TEXT_MODEL || "llama3";
        }
      } else {
        // If the user specified a custom Ollama endpoint, respect the model requested
        targetModel = req.body.model || "minimax m3";
      }

      // Format messages into OpenAI compatible style if using a custom cloud endpoint (like SiliconFlow)
      
      let endpoint = `${baseUrl}/chat/completions`;
      let requestBody: any = {};

      if (isOllamaLocal) {
        // Local Ollama API format
        endpoint = `${baseUrl}/api/chat`;
        requestBody = {
          model: targetModel,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.1,
          },
        };
        if (format) {
          requestBody.format = format;
        }
      } else {
        // OpenAI-Compatible Cloud API (SiliconFlow or others)
        const formattedMessages = messages.map((msg: any) => {
          if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
            const contentArray: any[] = [{ type: "text", text: msg.content || "" }];
            
            msg.images.forEach((img: string) => {
              // Ensure base64 prefix
              const imgSrc = img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`;
              contentArray.push({
                type: "image_url",
                image_url: {
                  url: imgSrc,
                },
              });
            });

            return {
              role: msg.role,
              content: contentArray,
            };
          } else {
            return {
              role: msg.role,
              content: msg.content || "",
            };
          }
        });

        requestBody = {
          model: targetModel,
          messages: formattedMessages,
          stream: false,
          temperature: 0.1,
        };

        // Attach JSON response format if schema or format requested.
        // NOTE: SiliconFlow's vision model (Qwen2-VL) does NOT support response_format/JSON mode with vision input.
        if (format && !hasImages) {
          requestBody.response_format = { type: "json_object" };
        }
      }

      console.log(`[Proxy] Routing request to ${endpoint} using model: ${targetModel}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cleanApiKey ? { Authorization: `Bearer ${cleanApiKey}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Proxy] API error response: ${errText}`);
        
        // Write the error log to a file for debugging
        try {
          const fs = await import("fs");
          const logContent = JSON.stringify({
            timestamp: new Date().toISOString(),
            baseUrl,
            endpoint,
            targetModel,
            apiKeyPrefix: cleanApiKey ? cleanApiKey.substring(0, 10) + "..." : "none",
            status: response.status,
            statusText: response.statusText,
            errorResponse: errText,
            requestBodyKeys: Object.keys(requestBody),
            hasImages
          }, null, 2);
          fs.writeFileSync("./api_error.log", logContent);
        } catch (logErr) {
          console.error("Failed to write to api_error.log:", logErr);
        }

        return res.status(response.status).json({
          error: `API error response from upstream: ${response.statusText}`,
          details: errText,
        });
      }

      const responseData = await response.json();

      // Transform response to match local Ollama format expected by client
      if (isOllamaLocal) {
        return res.json(responseData);
      } else {
        const content = responseData.choices?.[0]?.message?.content || "";
        return res.json({
          message: {
            role: "assistant",
            content: content,
          },
        });
      }
    } catch (err: any) {
      console.error("[Proxy] Unexpected server proxy error:", err);
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  });

  // Vite middleware for development vs static build files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Dev] Mount Vite dev middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // In Express v5, wildcards are matched using '*all' instead of '*'
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Prod] Serving static build files from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on port ${PORT}`);
  });
}

startServer();
