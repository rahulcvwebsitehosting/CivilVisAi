import { CIVIL_ENGINEER_SYSTEM_PROMPT } from "../constants.ts";
import { StructuralAnalysis } from "../types.ts";

export const OLLAMA_MODEL = "minimax m3";

const safeGetEnv = (key: string): string => {
  try {
    const metaEnv = (import.meta as any).env || {};
    // Prioritize VITE_ prefixed variables first for Vite/Vercel compatibility
    if (metaEnv[`VITE_${key}`]) return String(metaEnv[`VITE_${key}`]);
    if (metaEnv[key]) return String(metaEnv[key]);
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process && process.env) {
      // Prioritize VITE_ prefixed variables first for Vite/Vercel compatibility
      if (process.env[`VITE_${key}`]) return String(process.env[`VITE_${key}`]);
      if (process.env[key]) return String(process.env[key]);
    }
  } catch (e) {}

  try {
    if (typeof window !== 'undefined' && (window as any).process?.env) {
      const wEnv = (window as any).process.env;
      // Prioritize VITE_ prefixed variables first for Vite/Vercel compatibility
      if (wEnv[`VITE_${key}`]) return String(wEnv[`VITE_${key}`]);
      if (wEnv[key]) return String(wEnv[key]);
    }
  } catch (e) {}

  return "";
};

export const getOllamaBaseUrl = (): string => {
  return safeGetEnv("OLLAMA_BASE_URL") || 
         safeGetEnv("OLLAMA_HOST") || 
         "http://localhost:11434";
};

export const getOllamaApiKey = (): string => {
  return safeGetEnv("OLLAMA_API_KEY") ||
         safeGetEnv("OLLAMA_KEY") ||
         safeGetEnv("API_KEY") ||
         "";
};

export const getApiKey = (): string => {
  return getOllamaApiKey() || "ollama-key-active";
};

interface OllamaMessage {
  role: string;
  content: string;
  images?: string[];
}

export const callDirectClientSide = async (
  messages: OllamaMessage[],
  format?: any
): Promise<string> => {
  // Only Gemini works directly from the browser (supports CORS)
  const geminiKey = safeGetEnv("GEMINI_API_KEY") || safeGetEnv("VITE_GEMINI_API_KEY");
  if (geminiKey) {
    console.log("[Client Fallback] Calling Gemini directly from browser...");
    try {
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
                data: cleanBase64
              }
            });
          }
        }

        contents.push({ role, parts });
      }

      const payload: any = { contents };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      if (format) {
        const convertSchemaTypes = (schema: any): any => {
          if (!schema || typeof schema !== "object") return schema;
          const result = { ...schema };
          if (typeof result.type === "string") {
            result.type = result.type.toUpperCase();
          }
          if (result.properties) {
            const newProps: any = {};
            for (const [k, v] of Object.entries(result.properties)) {
              newProps[k] = convertSchemaTypes(v);
            }
            result.properties = newProps;
          }
          if (result.items) {
            result.items = convertSchemaTypes(result.items);
          }
          return result;
        };

        payload.generationConfig = {
          responseMimeType: "application/json",
          responseSchema: convertSchemaTypes(format)
        };
      }

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const gRes = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        return gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const gErrText = await gRes.text();
        console.error("[Client Fallback] Direct Gemini API call failed:", gErrText);
      }
    } catch (err) {
      console.error("[Client Fallback] Direct Gemini API call threw error:", err);
    }
  }

  // Ollama/SiliconFlow cannot be called directly from the browser (CORS).
  // All API calls must go through the server at /api/chat.
  throw new Error(
    "Server API is unreachable. Make sure your Vercel environment variables are set:\n" +
    "  OLLAMA_BASE_URL=https://api.ollama.com\n" +
    "  OLLAMA_API_KEY=your_key_here\n" +
    "Or use VITE_GEMINI_API_KEY for direct browser-based access."
  );
};

export const callOllama = async (
  messages: OllamaMessage[],
  format?: any,
  systemInstruction?: string
): Promise<string> => {
  const baseUrl = getOllamaBaseUrl();
  const apiKey = getOllamaApiKey();

  const finalMessages = [...messages];
  if (systemInstruction) {
    finalMessages.unshift({
      role: 'system',
      content: systemInstruction
    });
  }

  try {
    const response = await fetch(`/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: finalMessages,
        format: format || undefined,
        stream: false,
        options: {
          temperature: 0.1
        }
      })
    });

    if (response.status === 404) {
      console.warn("[Client] /api/chat returned 404. Trying direct Gemini fallback.");
      try {
        return await callDirectClientSide(finalMessages, format);
      } catch (directErr) {
        throw new Error(
          "Server API not found. Deploy the server with your API keys, or set VITE_GEMINI_API_KEY for browser-based access."
        );
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Client] Server API error:", errorText);
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.details) throw new Error(parsed.details);
        if (parsed.error) throw new Error(parsed.error);
      } catch (e: any) {
        if (e.message && !e.message.includes("JSON")) throw e;
      }
      throw new Error(`Server error: ${response.status}. ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || data.response || "";
  } catch (err: any) {
    if (err.message && !err.message.includes("Server")) {
      console.warn("[Client] Fetch failed, trying direct Gemini fallback...", err.message);
      try {
        return await callDirectClientSide(finalMessages, format);
      } catch (fallbackErr: any) {
        throw new Error(
          "Cannot reach API server and no Gemini fallback configured. " +
          "Set VITE_GEMINI_API_KEY in Vercel for browser-based access, " +
          "or configure OLLAMA_BASE_URL/OLLAMA_API_KEY for server-based access."
        );
      }
    }
    throw err;
  }
};

const CORRECTION_DB_KEY = 'civilvision_correction_memory';

// Utility for exponential backoff retries
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 1500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('QUOTA_EXCEEDED');
      
      if (!isQuotaError || i === maxRetries - 1) {
        if (isQuotaError) {
          const quotaErr = new Error("QUOTA_EXCEEDED");
          (quotaErr as any).status = 429;
          throw quotaErr;
        }
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Ollama call failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export const getImageHash = async (base64: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(base64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const saveCorrection = (hash: string, data: StructuralAnalysis) => {
  try {
    const db = JSON.parse(localStorage.getItem(CORRECTION_DB_KEY) || '{}');
    db[hash] = { data, timestamp: Date.now() };
    
    try {
      localStorage.setItem(CORRECTION_DB_KEY, JSON.stringify(db));
    } catch (e) {
      // If quota exceeded, implement simple eviction (LRU)
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn("LocalStorage quota exceeded. Evicting old entries...");
        
        // Convert to array and sort by timestamp
        const entries = Object.entries(db).sort((a: any, b: any) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 40% of entries
        const toRemove = Math.max(1, Math.ceil(entries.length * 0.4));
        for (let i = 0; i < toRemove; i++) {
          delete db[entries[i][0]];
        }
        
        // Try saving again
        try {
          localStorage.setItem(CORRECTION_DB_KEY, JSON.stringify(db));
        } catch (retryError) {
          // If still failing, try saving without the large X-ray image
          console.error("Still failing after eviction. Saving without X-ray image.");
          if (db[hash] && db[hash].data) {
            const strippedData = { ...db[hash].data };
            delete strippedData.xRayImageUrl;
            db[hash].data = strippedData;
            localStorage.setItem(CORRECTION_DB_KEY, JSON.stringify(db));
          }
        }
      } else {
        throw e;
      }
    }
  } catch (err) {
    console.error("Failed to save correction to memory:", err);
  }
};

export const getStoredCorrection = (hash: string): StructuralAnalysis | null => {
  const db = JSON.parse(localStorage.getItem(CORRECTION_DB_KEY) || '{}');
  return db[hash]?.data || null;
};

// Client-side Image Compression - AGGRESSIVE OPTIMIZATION
export const compressImage = async (base64Str: string, maxWidth = 512, quality = 0.5): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Str}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // toDataURL returns "data:image/jpeg;base64,..."
      const newDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(newDataUrl.split(',')[1]);
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const analyzeImage = async (base64Image: string, userContext?: string, onFirstChunk?: () => void): Promise<StructuralAnalysis> => {
  const isOffline = localStorage.getItem('civilvision_offline') === 'true';
  if (isOffline) {
    if (onFirstChunk) {
      setTimeout(() => onFirstChunk(), 400);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check user context to see if they mentioned steel, column, masonry, etc. to make the offline response dynamic!
    const ctx = (userContext || "").toLowerCase();
    const isSteel = ctx.includes('steel') || ctx.includes('bridge') || ctx.includes('iron');
    const isPavement = ctx.includes('road') || ctx.includes('pavement') || ctx.includes('asphalt');
    
    if (isSteel) {
      return {
        elementName: "Structural Steel Frame Connection (Offline Diagnostic)",
        elementCategory: "STRUCTURE",
        confidenceScore: 0.91,
        healthScore: 74,
        executiveSummary: {
          brief: "Offline heuristic analysis of a structural steel member. Surface inspection shows indications of rust formation on gusset plates and adjacent bolted clusters.",
          keyEngineeringPoints: [
            "Primary load-carrying beams exhibit normal axial deflection thresholds.",
            "Local rust spot clusters on connection brackets require wire scraping and safety coating.",
            "IS 800 standards for minimum bolt edge distance seem to be met across visible rows."
          ]
        },
        isCodeReferences: ["IS 800:2007", "IS 1893 (Part 1)"],
        defects: [
          {
            type: "Bolted Connection Corrosion",
            severity: "MEDIUM",
            cause: "Exposure to atmospheric moisture combined with breakdown of initial zinc-chromate primer coating.",
            remedy: "Brush clear with stiff wire, apply an approved phosphoric-acid rust converter, and re-prime with epoxy red-oxide."
          }
        ],
        constructionMethodology: {
          methodSummary: "Heavy pre-fabricated steel sections joined monolithically via high-tensile friction grip (HTFG) bolts.",
          machinerySpecs: {
            liftingCapacity: "15 Metric Tons",
            boomLength: "24 Meters",
            safetyFactor: "2.5:1 Class A"
          }
        },
        recommendations: [
          "Conduct ultrasonic thickness gauging on critical gussets to ensure section loss remains under the 10% design allowance.",
          "Verify bolt torque specifications using a calibrated dial indicator wrench on 10% of random samples."
        ]
      };
    } else if (isPavement) {
      return {
        elementName: "Rigid Concrete Pavement Slab (Offline Diagnostic)",
        elementCategory: "PAVEMENT",
        confidenceScore: 0.88,
        healthScore: 68,
        executiveSummary: {
          brief: "Offline diagnostic of concrete pavement roadway. Transverse thermal cracking is present near the expansion joint seal.",
          keyEngineeringPoints: [
            "Load transfer bars (dowel bars) seem vertically aligned but joint sealant is degraded.",
            "Minor surface scaling observed, indicative of local freeze-thaw or aggregate quality issues.",
            "Sub-base compaction appears stable with no immediate signs of corner pumping or base failure."
          ]
        },
        isCodeReferences: ["IRC:15-2011", "IS 456:2000"],
        defects: [
          {
            type: "Transverse Joint Crack",
            severity: "MEDIUM",
            cause: "Sub-optimal expansion spacing combined with shrinkage stress under wheel loading.",
            remedy: "Clean crack channel, apply polymer-modified bitumen sealing compound, and re-pour joint elastomer."
          }
        ],
        constructionMethodology: {
          methodSummary: "Vibrated cement concrete pavement slab cast over water-bound macadam (WBM) base course.",
          concreteSpecs: {
            grade: "M30",
            mixDesign: [
              { material: "Portland Pozzolana Cement", quantity: "410 kg/m³", proportion: "1" },
              { material: "Zone II Sand", quantity: "610 kg/m³", proportion: "1.5" },
              { material: "Crushed Stone (10-20mm)", quantity: "1220 kg/m³", proportion: "3.0" }
            ]
          }
        },
        recommendations: [
          "Re-seal all joint structures before monsoon season to prevent subsurface water percolation.",
          "Verify dowel bar positioning using ground-penetrating radar (GPR) to assess joint load transfer efficiency."
        ]
      };
    } else {
      // Default Concrete column/beam
      return {
        elementName: "Reinforced Concrete Column (Offline Diagnostic)",
        elementCategory: "STRUCTURE",
        confidenceScore: 0.94,
        healthScore: 82,
        executiveSummary: {
          brief: "Offline inspection of monolithic RCC pillar. No major flexural or buckling distress noted. Supercial hairline cracks observed on plaster layer.",
          keyEngineeringPoints: [
            "Load bearing section remains in safe stress envelope under gravity loads.",
            "Concrete compaction is excellent with no signs of aggregate honeycombing or segregation.",
            "Transverse links (stirrups) detailing appears compliant with IS 13920 ductile detailing protocols."
          ]
        },
        isCodeReferences: ["IS 456:2000", "IS 13920:2016"],
        defects: [
          {
            type: "Plaster Hairline Crazing",
            severity: "LOW",
            cause: "Rapid evaporation of moisture during plastering, leading to minor surface contraction.",
            remedy: "Apply premium cement-based elastomeric putty and repaint with waterproofing exterior grade paint."
          }
        ],
        constructionMethodology: {
          methodSummary: "Cast-in-place monolithic RCC column structure using custom engineered plywood formwork.",
          concreteSpecs: {
            grade: "M25",
            mixDesign: [
              { material: "Ordinary Portland Cement (Gr 43)", quantity: "360 kg/m³", proportion: "1" },
              { material: "Coarse River Sand", quantity: "640 kg/m³", proportion: "1.78" },
              { material: "Coarse Aggregates (20mm)", quantity: "1150 kg/m³", proportion: "3.2" }
            ]
          }
        },
        recommendations: [
          "Monitor column base sections for any moisture seepage or chemical efflorescence.",
          "Sustain curing routines on any newly built expansion segments for a continuous 10-day timeline."
        ]
      };
    }
  }

  return callWithRetry(async () => {
    // 1. Client-Side Compression
    const compressedBase64 = await compressImage(base64Image, 512, 0.5);

    if (onFirstChunk) {
      onFirstChunk();
    }

    const schemaPrompt = `
You are a Senior Structural Engineer. Analyze the structural element and identify any defects, distress, or anomalies.
Provide your response strictly in the following JSON format:
{
  "elementName": "string representing the element name",
  "elementCategory": "EXPERIMENT | STRUCTURE | MACHINERY | PAVEMENT | UNDEFINED",
  "confidenceScore": number between 0 and 1,
  "healthScore": number between 0 and 100,
  "executiveSummary": {
    "brief": "detailed overview brief of findings",
    "keyEngineeringPoints": ["bullet point 1", "bullet point 2"]
  },
  "isCodeReferences": ["IS 456", "IS 800", etc.],
  "defects": [
    {
      "type": "type of defect",
      "severity": "Low | Medium | Critical",
      "cause": "cause of defect",
      "remedy": "remedy suggestion"
    }
  ],
  "constructionMethodology": {
    "methodSummary": "summary of construction specs",
    "concreteSpecs": {
      "grade": "e.g., M25",
      "mixDesign": [
        { "material": "Cement", "quantity": "350 kg/m³", "proportion": "1" }
      ]
    },
    "machinerySpecs": {
      "liftingCapacity": "lifting specifications",
      "boomLength": "boom layout",
      "safetyFactor": "safety rating"
    }
  },
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;

    const userMsg = `Perform a detailed structural health inspection on this image. 
${userContext ? `User Provided Context: ${userContext}` : ""}
Identify the element and scan for any defects, distress, or anomalies. Provide a health score from 0-100 (100 being perfect). JSON only.`;

    const formatSchema = {
      type: "object",
      properties: {
        elementName: { type: "string" },
        elementCategory: { type: "string" },
        confidenceScore: { type: "number" },
        healthScore: { type: "number" },
        executiveSummary: {
          type: "object",
          properties: {
            brief: { type: "string" },
            keyEngineeringPoints: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["brief", "keyEngineeringPoints"]
        },
        isCodeReferences: {
          type: "array",
          items: { type: "string" }
        },
        defects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              severity: { type: "string" },
              cause: { type: "string" },
              remedy: { type: "string" }
            },
            required: ["type", "severity", "cause", "remedy"]
          }
        },
        constructionMethodology: {
          type: "object",
          properties: {
            methodSummary: { type: "string" },
            concreteSpecs: {
              type: "object",
              properties: {
                grade: { type: "string" },
                mixDesign: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      material: { type: "string" },
                      quantity: { type: "string" },
                      proportion: { type: "string" }
                    },
                    required: ["material", "quantity", "proportion"]
                  }
                }
              },
              required: ["grade"]
            },
            machinerySpecs: {
              type: "object",
              properties: {
                liftingCapacity: { type: "string" },
                boomLength: { type: "string" },
                safetyFactor: { type: "string" }
              }
            }
          },
          required: ["methodSummary"]
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["elementName", "elementCategory", "confidenceScore", "healthScore", "executiveSummary", "defects", "constructionMethodology", "recommendations"]
    };

    const textResponse = await callOllama(
      [
        {
          role: 'user',
          content: `${schemaPrompt}\n\n${userMsg}`,
          images: [compressedBase64]
        }
      ],
      formatSchema,
      CIVIL_ENGINEER_SYSTEM_PROMPT
    );

    try {
      const start = textResponse.indexOf('{');
      const end = textResponse.lastIndexOf('}');
      if (start === -1 || end === -1) {
        return JSON.parse(textResponse);
      }
      return JSON.parse(textResponse.substring(start, end + 1));
    } catch (error) {
      console.error("Ollama Parse Error:", error, "Raw text:", textResponse);
      throw new Error("ENGINEERING_LINK_FAILED");
    }
  });
};

export const refineExpertAdvice = async (currentData: StructuralAnalysis, userContext: string): Promise<Partial<StructuralAnalysis>> => {
  return callWithRetry(async () => {
    const userMsg = `REFINE Structural Analysis for: ${currentData.elementName}. 
    STRICT LIMIT: Max 100 words. Be extremely brief.
    Context: ${userContext}.
    
    Provide your refined analysis strictly in the following JSON format:
    {
      "executiveSummary": {
        "brief": "refined brief overview",
        "keyEngineeringPoints": ["refined point 1", "refined point 2"]
      },
      "recommendations": ["refined rec 1", "refined rec 2"]
    }`;

    const formatSchema = {
      type: "object",
      properties: {
        executiveSummary: {
          type: "object",
          properties: {
            brief: { type: "string" },
            keyEngineeringPoints: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["brief", "keyEngineeringPoints"]
        },
        recommendations: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["executiveSummary", "recommendations"]
    };

    const textResponse = await callOllama(
      [
        {
          role: 'user',
          content: userMsg
        }
      ],
      formatSchema,
      CIVIL_ENGINEER_SYSTEM_PROMPT
    );

    try {
      const start = textResponse.indexOf('{');
      const end = textResponse.lastIndexOf('}');
      if (start === -1 || end === -1) return JSON.parse(textResponse);
      return JSON.parse(textResponse.substring(start, end + 1));
    } catch (err) {
      console.error("Ollama Refine Parse Error:", err, "Raw text:", textResponse);
      return {};
    }
  });
};

export const expandAnalysisSection = async (data: StructuralAnalysis, section: 'summary' | 'technical' | 'inspection' | 'consult'): Promise<string> => {
  return callWithRetry(async () => {
    let specificPrompt = "";
    if (section === 'summary') {
      specificPrompt = `Expand the Executive Summary for ${data.elementName}. Include:
      - Purpose & Significance of the element.
      - Detailed Site Observations based on the brief: "${data.executiveSummary?.brief}".
      - Potential Long-term Structural Implications.
      Format: Use Markdown with bold headers and bullet points.`;
    } else if (section === 'technical') {
      specificPrompt = `Create a Detailed Technical Specification Report for ${data.elementName}. Include:
      - A Markdown Table of Material Properties (Grade, Mix Ratio, Density, Slump, Strength).
      - Relevant IS Codes (e.g., IS 456, IS 800, IS 2911) with specific clause references.
      - Construction tolerances and standards.
      Format: Markdown Table is MANDATORY.`;
    } else if (section === 'inspection') {
      specificPrompt = `Generate a Site Inspection Checklist for ${data.elementName}. Include:
      - A Step-by-Step Verification Checklist formatted as a Markdown Table (Check Item | Acceptance Criteria | Method).
      - Safety precautions during inspection.
      - Common defects to look for beyond: "${(data.defects || []).map(d => d.type).join(', ')}".`;
    } else if (section === 'consult') {
      specificPrompt = `Draft a Senior Engineer's Expert Addendum for ${data.elementName}. Include:
      - Critical recommendations for repair or maintenance.
      - A breakdown of required resources (Labor, Material, Machinery).
      - Estimated timeline for rectification if defects exist.
      Format: Professional Engineering Note style.`;
    }

    const userMsg = `ACT AS A SENIOR LEAD STRUCTURAL ENGINEER.
    TASK: ${specificPrompt}
    CONTEXT: Element is ${data.elementName} (${data.elementCategory}).
    EXISTING DATA: ${JSON.stringify(data).substring(0, 1000)}
    OUTPUT: Comprehensive technical markdown.`;

    return await callOllama(
      [
        {
          role: 'user',
          content: userMsg
        }
      ],
      undefined,
      "You are a Senior Structural Engineer. Output professional, detailed, formatted Markdown. Use Tables where requested."
    );
  });
};

export const generateStructuralXRay = async (data: StructuralAnalysis): Promise<{ imageUrl: string; typology: 'Steel' | 'Concrete' }> => {
  // 1. Classification Logic
  const fullTextContext = `${data.elementName} ${data.elementCategory} ${data.executiveSummary?.brief}`.toLowerCase();
  const isSteel = /bridge|truss|steel|gusset|rivet|bolt|girder|cantilever truss/.test(fullTextContext);
  const typology: 'Steel' | 'Concrete' = isSteel ? 'Steel' : 'Concrete';

  // Generate a beautiful, technical SVG schematic representing the internal structural details
  let svgContent = "";
  if (typology === 'Steel') {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" style="background-color: #0b0f19;">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="50%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>
  <!-- Grid Background -->
  <rect width="800" height="450" fill="url(#grid)" />
  
  <!-- Blueprint border -->
  <rect x="10" y="10" width="780" height="430" fill="none" stroke="#3b82f6" stroke-width="1" stroke-dasharray="5 5" />
  
  <!-- Steel Truss Drawing -->
  <g stroke="url(#metal)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Bottom chord -->
    <line x1="100" y1="350" x2="700" y2="350" />
    <!-- Top chord -->
    <line x1="200" y1="150" x2="600" y2="150" />
    <!-- Diagonals and Verticals -->
    <line x1="100" y1="350" x2="200" y2="150" />
    <line x1="200" y1="150" x2="200" y2="350" />
    <line x1="200" y1="350" x2="350" y2="150" />
    <line x1="350" y1="150" x2="350" y2="350" />
    <line x1="350" y1="350" x2="500" y2="150" />
    <line x1="500" y1="150" x2="500" y2="350" />
    <line x1="500" y1="350" x2="600" y2="150" />
    <line x1="600" y1="150" x2="600" y2="350" />
    <line x1="600" y1="150" x2="700" y2="350" />
  </g>

  <!-- Gusset Plates & Connections (Tech style) -->
  <g fill="#64748b" stroke="#38bdf8" stroke-width="1.5">
    <circle cx="100" cy="350" r="10" />
    <circle cx="200" cy="150" r="10" />
    <circle cx="200" cy="350" r="10" />
    <circle cx="350" cy="150" r="10" />
    <circle cx="350" cy="350" r="10" />
    <circle cx="500" cy="150" r="10" />
    <circle cx="500" cy="350" r="10" />
    <circle cx="600" cy="150" r="10" />
    <circle cx="600" cy="350" r="10" />
    <circle cx="700" cy="350" r="10" />
  </g>

  <!-- Dimension Lines & Annotations -->
  <g stroke="#38bdf8" stroke-width="1" fill="#38bdf8" font-family="monospace" font-size="10">
    <!-- Bottom Dimension -->
    <line x1="100" y1="390" x2="700" y2="390" />
    <polyline points="100,387 100,393" />
    <polyline points="700,387 700,393" />
    <text x="370" y="385" text-anchor="middle">SPAN = 60.00 m</text>

    <!-- Truss Height Dimension -->
    <line x1="50" y1="150" x2="50" y2="350" />
    <polyline points="47,150 53,150" />
    <polyline points="47,350 53,350" />
    <text x="40" y="255" text-anchor="middle" transform="rotate(-90 40 255)">HEIGHT = 15.00 m</text>

    <!-- Technical Specs Box -->
    <rect x="580" y="30" width="190" height="90" fill="#0f172a" stroke="#1e293b" rx="5" />
    <text x="590" y="50" font-weight="bold" fill="#f8fafc">STRUCTURAL B.I.M.</text>
    <text x="590" y="65">TYPOLOGY: STEEL TRUSS</text>
    <text x="590" y="80">GRADE: IS 2062 E250</text>
    <text x="590" y="95">STATUS: AI INSPECTED</text>
  </g>
</svg>
    `;
  } else {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%" style="background-color: #0b0f19;">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
    <linearGradient id="rebar" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
  </defs>
  <!-- Grid Background -->
  <rect width="800" height="450" fill="url(#grid)" />
  
  <!-- Blueprint border -->
  <rect x="10" y="10" width="780" height="430" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="5 5" />
  
  <!-- Concrete Pillar Translucent Border -->
  <rect x="250" y="50" width="300" height="320" fill="#334155" fill-opacity="0.2" stroke="#475569" stroke-width="3" rx="10" />

  <!-- Rebar cage - Longitudinal Steel Bars -->
  <g stroke="url(#rebar)" stroke-width="10" stroke-linecap="round">
    <line x1="280" y1="60" x2="280" y2="360" />
    <line x1="380" y1="60" x2="380" y2="360" />
    <line x1="420" y1="60" x2="420" y2="360" />
    <line x1="520" y1="60" x2="520" y2="360" />
  </g>

  <!-- Rebar cage - Stirrups / Shear Ties -->
  <g stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none">
    <rect x="280" y="80" width="240" height="20" rx="2" />
    <rect x="280" y="130" width="240" height="20" rx="2" />
    <rect x="280" y="180" width="240" height="20" rx="2" />
    <rect x="280" y="230" width="240" height="20" rx="2" />
    <rect x="280" y="280" width="240" height="20" rx="2" />
    <rect x="280" y="330" width="240" height="20" rx="2" />
  </g>

  <!-- Dimension Lines & Annotations -->
  <g stroke="#f59e0b" stroke-width="1" fill="#f59e0b" font-family="monospace" font-size="10">
    <!-- Lateral tie spacing annotation -->
    <line x1="550" y1="130" x2="550" y2="180" />
    <polyline points="547,130 553,130" />
    <polyline points="547,180 553,180" />
    <text x="560" y="160" text-anchor="start">150 mm c/c</text>

    <!-- Column Diameter Dimension -->
    <line x1="250" y1="390" x2="550" y2="390" />
    <polyline points="250,387 250,393" />
    <polyline points="550,387 550,393" />
    <text x="400" y="405" text-anchor="middle">WIDTH = 300 mm</text>

    <!-- Technical Specs Box -->
    <rect x="580" y="30" width="190" height="90" fill="#0f172a" stroke="#1e293b" rx="5" />
    <text x="590" y="50" font-weight="bold" fill="#f8fafc">REBAR LAYOUT</text>
    <text x="590" y="65">TYPOLOGY: RCC COLUMN</text>
    <text x="590" y="80">GRADE: M30 / Fe500D</text>
    <text x="590" y="95">CODE: IS 13920 / 456</text>
  </g>
</svg>
    `;
  }

  const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
  return {
    imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
    typology
  };
};

export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
