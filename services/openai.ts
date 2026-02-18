const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export interface OpenAIExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

export async function extractTextFromDocument(
  base64Data: string,
  apiKey: string,
  mimeType:
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  filename: string,
): Promise<OpenAIExtractionResult> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a text extraction assistant. Extract ALL text content from the provided document. " +
              "Preserve the original paragraph structure. Use double newlines between paragraphs. " +
              "Do not add any commentary, headers, or summaries. Output ONLY the extracted text.",
          },
          {
            role: "user",
            content: [
              {
                type: "file",
                file: {
                  filename,
                  file_data: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: "Extract all the text from this document.",
              },
            ],
          },
        ],
        max_tokens: 16000,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return {
          success: false,
          text: "",
          error: "Invalid API key. Check your OpenAI key in Settings.",
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          text: "",
          error: "Rate limit exceeded. Please try again in a moment.",
        };
      }
      return {
        success: false,
        text: "",
        error: errorBody?.error?.message || `API error (${response.status})`,
      };
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content?.trim() || "";

    if (!extractedText) {
      return {
        success: false,
        text: "",
        error: "No text could be extracted from this document.",
      };
    }

    return { success: true, text: extractedText };
  } catch {
    return {
      success: false,
      text: "",
      error: "Network error. Check your internet connection.",
    };
  }
}

function fetchWithTimeout(
  input: string | URL,
  init?: RequestInit,
  timeoutMs = 15_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

function stripHtmlBoilerplate(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

export async function extractTextFromUrl(
  url: string,
  apiKey: string,
): Promise<OpenAIExtractionResult> {
  try {
    console.log("[URL Extract] Fetching page:", url);
    const pageResponse = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GuidedSight/1.0)",
        Accept: "text/html",
      },
    });
    console.log("[URL Extract] Page response status:", pageResponse.status);

    if (!pageResponse.ok) {
      console.log("[URL Extract] Page fetch failed:", pageResponse.status);
      return {
        success: false,
        text: "",
        error: `Could not fetch URL (${pageResponse.status})`,
      };
    }

    const rawHtml = await pageResponse.text();
    console.log("[URL Extract] Raw HTML length:", rawHtml.length);

    if (!rawHtml || rawHtml.length < 100) {
      console.log("[URL Extract] HTML too short or empty");
      return {
        success: false,
        text: "",
        error: "The URL returned no readable content.",
      };
    }

    const cleaned = stripHtmlBoilerplate(rawHtml);
    const trimmedHtml =
      cleaned.length > 200_000 ? cleaned.substring(0, 200_000) : cleaned;
    console.log(
      "[URL Extract] After cleanup — cleaned:",
      cleaned.length,
      "trimmed:",
      trimmedHtml.length,
    );

    console.log("[URL Extract] Sending to OpenAI (gpt-4o-mini)...");
    const response = await fetchWithTimeout(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a text extraction assistant. Given the HTML of a webpage, extract the main article or body content as clean, readable plain text. " +
                "Remove navigation, ads, footers, sidebars, scripts, and boilerplate. " +
                "Do NOT summarize, shorten, or omit any of the main body content. Output the COMPLETE article/body text. " +
                "Preserve paragraph structure using double newlines. " +
                "If there is an article title, include it as the first line. " +
                "Output ONLY the extracted text, no commentary.",
            },
            {
              role: "user",
              content: `Extract the full main body/article text from this webpage HTML. Do not summarize or cut out any body content:\n\n${trimmedHtml}`,
            },
          ],
          max_tokens: 16384,
          temperature: 0,
        }),
      },
      60_000,
    );
    console.log("[URL Extract] OpenAI response status:", response.status);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("[URL Extract] OpenAI error:", JSON.stringify(errorBody));
      if (response.status === 401) {
        return {
          success: false,
          text: "",
          error: "Invalid API key. Check your OpenAI key in Settings.",
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          text: "",
          error: "Rate limit exceeded. Please try again in a moment.",
        };
      }
      return {
        success: false,
        text: "",
        error: errorBody?.error?.message || `API error (${response.status})`,
      };
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content?.trim() || "";
    console.log(
      "[URL Extract] Extracted text length:",
      extractedText.length,
      "| finish_reason:",
      data.choices?.[0]?.finish_reason,
    );

    if (!extractedText) {
      console.log("[URL Extract] No text extracted from response");
      return {
        success: false,
        text: "",
        error: "Could not extract readable text from this URL.",
      };
    }

    console.log("[URL Extract] Success");
    return { success: true, text: extractedText };
  } catch (err) {
    console.error("[URL Extract] Exception:", err);
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        text: "",
        error: "Request timed out. The page took too long to respond.",
      };
    }
    return {
      success: false,
      text: "",
      error: "Network error. Check your internet connection.",
    };
  }
}
