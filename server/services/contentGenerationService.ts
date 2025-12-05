import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

/**
 * Content Generation Service
 * Handles AI-powered content generation for ebooks, blogs, and reports
 * Uses market data and reports (manually entered from Accio) as source material
 */

export interface GenerateContentInput {
  template_id?: string;
  content_type: "ebook" | "blog" | "report" | "newsletter" | "whitepaper";
  title: string;
  source_data?: {
    market_data?: any;
    report_sections?: string[];
    keywords?: string[];
  };
  metadata?: {
    author?: string;
    tags?: string[];
    categories?: string[];
  };
}

/**
 * Generate content using AI (Perplexity or Gemini)
 */
export async function generateContent(
  userId: string,
  input: GenerateContentInput
): Promise<any> {
  try {
    // Get template if specified
    let template = null;
    if (input.template_id) {
      const { data, error } = await supabaseAdmin
        .from("content_templates")
        .select("*")
        .eq("id", input.template_id)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        throw new NotFoundError("Content template");
      }
      template = data;
    }

    // Build generation prompt
    const prompt = buildContentPrompt(input, template);

    // Generate content using Perplexity (or fallback to Gemini)
    const content = await generateWithAI(prompt, input.content_type);

    // Calculate word count and reading time
    const wordCount = content.raw_content?.split(/\s+/).length || 0;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed

    // Store generated content
    const { data: generatedContent, error } = await supabaseAdmin
      .from("generated_content")
      .insert({
        template_id: input.template_id || null,
        title: input.title,
        content_type: input.content_type,
        content: content.structured || {},
        raw_content: content.raw_content || "",
        metadata: {
          author: input.metadata?.author || "LithiumBuy AI",
          tags: input.metadata?.tags || [],
          categories: input.metadata?.categories || [],
        },
        source_data: input.source_data || {},
        ai_model: "perplexity",
        generation_prompt: prompt,
        word_count: wordCount,
        reading_time_minutes: readingTimeMinutes,
        status: "draft",
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save generated content: ${error.message}`);
    }

    logger.info(
      { contentId: generatedContent.id, contentType: input.content_type, userId },
      "Content generated successfully"
    );

    return generatedContent;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        input,
        userId,
      },
      "Failed to generate content"
    );
    throw error;
  }
}

/**
 * Build content generation prompt
 */
function buildContentPrompt(input: GenerateContentInput, template: any | null): string {
  let prompt = `Generate a comprehensive ${input.content_type} about the lithium market with the following requirements:\n\n`;
  prompt += `Title: ${input.title}\n\n`;

  if (template?.structure) {
    prompt += `Structure: ${JSON.stringify(template.structure)}\n\n`;
  }

  if (input.source_data?.market_data) {
    prompt += `Market Data: ${JSON.stringify(input.source_data.market_data)}\n\n`;
  }

  if (input.source_data?.keywords) {
    prompt += `Keywords to include: ${input.source_data.keywords.join(", ")}\n\n`;
  }

  prompt += `Generate well-structured, professional content suitable for ${input.content_type} format. Include:\n`;
  prompt += `- Executive summary\n`;
  prompt += `- Detailed analysis\n`;
  prompt += `- Data-driven insights\n`;
  prompt += `- Actionable recommendations\n`;
  prompt += `- Professional formatting\n\n`;
  prompt += `Return the content as JSON with sections and full text.`;

  return prompt;
}

/**
 * Generate content using AI
 */
async function generateWithAI(
  prompt: string,
  contentType: string
): Promise<{ structured: any; raw_content: string }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const model = process.env.PERPLEXITY_MODEL || "sonar-pro";

  if (!apiKey) {
    throw new ValidationError("PERPLEXITY_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a professional content writer specializing in lithium market analysis. Generate high-quality ${contentType} content based on the provided requirements.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from AI");
    }

    // Try to parse as JSON, fallback to plain text
    let structured: any = {};
    let raw_content = content;

    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        structured = JSON.parse(jsonMatch[1]);
        raw_content = structured.full_text || structured.content || content;
      } else {
        // Try parsing entire content as JSON
        structured = JSON.parse(content);
        raw_content = structured.full_text || structured.content || content;
      }
    } catch {
      // If JSON parsing fails, use content as-is
      structured = {
        sections: [
          {
            title: "Content",
            content: content,
          },
        ],
      };
      raw_content = content;
    }

    return { structured, raw_content };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to generate content with AI"
    );
    throw error;
  }
}

/**
 * Get generated content by ID
 */
export async function getGeneratedContent(contentId: string, userId: string): Promise<any> {
  const { data: content, error } = await supabaseAdmin
    .from("generated_content")
    .select("*")
    .eq("id", contentId)
    .single();

  if (error || !content) {
    throw new NotFoundError("Generated content");
  }

  // Verify access
  if (content.created_by !== userId) {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (profile?.role !== "admin" && content.status !== "published") {
      throw new ValidationError("Access denied");
    }
  }

  return content;
}

/**
 * List generated content
 */
export async function listGeneratedContent(filters?: {
  user_id?: string;
  content_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; total: number }> {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  let query = supabaseAdmin
    .from("generated_content")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.user_id) {
    query = query.eq("created_by", filters.user_id);
  }

  if (filters?.content_type) {
    query = query.eq("content_type", filters.content_type);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * Update content status
 */
export async function updateContentStatus(
  contentId: string,
  status: "draft" | "review" | "approved" | "published" | "archived",
  userId: string
): Promise<any> {
  // Verify ownership or admin
  const { data: content, error: fetchError } = await supabaseAdmin
    .from("generated_content")
    .select("created_by")
    .eq("id", contentId)
    .single();

  if (fetchError || !content) {
    throw new NotFoundError("Generated content");
  }

  if (content.created_by !== userId) {
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (profile?.role !== "admin") {
      throw new ValidationError("Only the content creator or admin can update status");
    }
  }

  const updateData: any = { status };
  if (status === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { data: updatedContent, error } = await supabaseAdmin
    .from("generated_content")
    .update(updateData)
    .eq("id", contentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update content status: ${error.message}`);
  }

  return updatedContent;
}

/**
 * Create content version
 */
export async function createContentVersion(contentId: string, userId: string): Promise<any> {
  // Get current content
  const { data: content, error: fetchError } = await supabaseAdmin
    .from("generated_content")
    .select("*")
    .eq("id", contentId)
    .single();

  if (fetchError || !content) {
    throw new NotFoundError("Generated content");
  }

  // Get latest version number
  const { data: versions } = await supabaseAdmin
    .from("content_versions")
    .select("version_number")
    .eq("content_id", contentId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

  // Create version snapshot
  const { data: version, error } = await supabaseAdmin
    .from("content_versions")
    .insert({
      content_id: contentId,
      version_number: nextVersion,
      content_snapshot: {
        title: content.title,
        content: content.content,
        raw_content: content.raw_content,
        metadata: content.metadata,
      },
      changed_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create version: ${error.message}`);
  }

  // Update content version
  await supabaseAdmin
    .from("generated_content")
    .update({ version: nextVersion })
    .eq("id", contentId);

  return version;
}
