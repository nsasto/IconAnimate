
import { GoogleGenAI } from "@google/genai";
import { getIconStyleJson, StyleConfig } from "../types";

// Removed global Window interface extension to avoid conflict with existing AIStudio type definitions.
// We use casting to any when accessing window.aistudio to ensure compatibility in the execution context.

export const checkApiKey = async (): Promise<boolean> => {
  try {
    // Accessing window.aistudio using casting to any to avoid property declaration conflicts.
    return await (window as any).aistudio.hasSelectedApiKey();
  } catch (e) {
    return false;
  }
};

export const requestApiKey = async (): Promise<void> => {
  // Accessing window.aistudio using casting to any to avoid property declaration conflicts.
  await (window as any).aistudio.openSelectKey();
};

export const generateIconImage = async (idea: string, config: StyleConfig): Promise<string> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure it uses the latest selected key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleJson = getIconStyleJson(config);
  const prompt = `generate a ${idea} ${config.format} with this json style ${JSON.stringify(styleJson)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: config.format === 'banner' ? "16:9" : "1:1"
      }
    }
  });

  // Iterating through all parts to find the image part as it may not be the first part in the response.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from model");
};

export const animateIconVideo = async (
  idea: string,
  base64Image: string,
  action: string,
  format: 'icon' | 'banner',
  onProgress: (status: string) => void
): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const videoPrompt = `Create a seamless loop animation of a soft 3D ${idea} ${format} performing a simple motion. The animation should include ${action}. All other elements must remain completely still. The background, lighting, and camera angle should match the reference image exactly. The motion should be smooth, subtle, and optimized for web or UI use. The animation must loop perfectly with no visible start or end.`;

  // Remove data URL prefix if present before passing to generateVideos as imageBytes.
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  onProgress("Starting video generation...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: videoPrompt,
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9' // Supported values for Veo are 16:9 or 9:16. Banners and icons will both use 16:9 canvas.
    }
  });

  const loadingMessages = [
    "Analyzing your design's structure...",
    "Modeling the 3D physics...",
    "Rendering light paths and shadows...",
    "Interpolating fluid motion...",
    "Optimizing for seamless loops...",
    "Almost there, finishing touches..."
  ];
  let msgIndex = 0;

  // Polling for video completion with reassuring progress messages.
  while (!operation.done) {
    onProgress(loadingMessages[msgIndex % loadingMessages.length]);
    msgIndex++;
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");

  // Appending the API key to the fetch request as required for accessing video download links.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
