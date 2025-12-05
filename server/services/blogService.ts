import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * Blog Service
 * Handles blog post generation and publishing
 */

/**
 * Publish blog to external platform
 */
export async function publishBlog(
  contentId: string,
  platform: "website" | "medium" | "linkedin"
): Promise<any> {
  try {
    const { data: content, error } = await supabaseAdmin
      .from("generated_content")
      .select("*")
      .eq("id", contentId)
      .single();

    if (error || !content) {
      throw new NotFoundError("Generated content");
    }

    if (content.content_type !== "blog") {
      throw new Error("Content is not a blog post");
    }

    // In a real implementation, this would:
    // 1. Format content for target platform
    // 2. Call platform API (Medium, LinkedIn, etc.)
    // 3. Store publishing record
    // 4. Update content status

    // Create publishing record
    const { data: publishing, error: publishError } = await supabaseAdmin
      .from("content_publishing")
      .insert({
        content_id: contentId,
        platform,
        status: "pending",
        publish_metadata: {
          platform_specific: "metadata",
        },
      })
      .select()
      .single();

    if (publishError) {
      throw new Error(`Failed to create publishing record: ${publishError.message}`);
    }

    logger.info({ contentId, platform, publishingId: publishing.id }, "Blog publishing initiated");

    return publishing;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        contentId,
        platform,
      },
      "Failed to publish blog"
    );
    throw error;
  }
}

/**
 * Get blog publishing status
 */
export async function getBlogPublishingStatus(contentId: string): Promise<any[]> {
  const { data: publishing, error } = await supabaseAdmin
    .from("content_publishing")
    .select("*")
    .eq("content_id", contentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch publishing status: ${error.message}`);
  }

  return publishing || [];
}
