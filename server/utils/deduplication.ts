import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";

/**
 * Deduplication utilities
 * Prevents duplicate suppliers from being imported
 */

/**
 * Check if supplier already exists
 * Uses fuzzy matching on name and location
 */
export async function findDuplicateSupplier(
  name: string,
  country: string
): Promise<string | null> {
  // Exact match on name
  const { data: exactMatch } = await supabaseAdmin
    .from("suppliers")
    .select("id, name")
    .ilike("name", name)
    .limit(1)
    .single();

  if (exactMatch) {
    return exactMatch.id;
  }

  // Fuzzy match using trigram similarity (requires pg_trgm extension)
  // This is a simplified version - in production, you'd use PostgreSQL's similarity function
  const { data: fuzzyMatches } = await supabaseAdmin
    .from("suppliers")
    .select(`
      id,
      name,
      locations(country)
    `)
    .ilike("name", `%${name.substring(0, 10)}%`); // Partial match on first 10 chars

  if (fuzzyMatches) {
    for (const match of fuzzyMatches) {
      const locations = match.locations as any[];
      const hasMatchingLocation = locations?.some(
        (loc) => loc.country?.toLowerCase() === country.toLowerCase()
      );

      if (hasMatchingLocation) {
        logger.info(
          { source: "deduplication", supplierId: match.id, name },
          "Found potential duplicate supplier"
        );
        return match.id;
      }
    }
  }

  return null;
}

/**
 * Merge supplier data (update existing with new data)
 */
export async function mergeSupplierData(
  existingId: string,
  newData: {
    supplier?: any;
    profile?: any;
    products?: any[];
    certifications?: any[];
  }
): Promise<void> {
  logger.info({ source: "deduplication", supplierId: existingId }, "Merging supplier data");

  // Update supplier if new data has better rating/more reviews
  if (newData.supplier) {
    const { data: existing } = await supabaseAdmin
      .from("suppliers")
      .select("rating, review_count")
      .eq("id", existingId)
      .single();

    if (existing) {
      const shouldUpdate =
        newData.supplier.rating > existing.rating ||
        newData.supplier.review_count > existing.review_count;

      if (shouldUpdate) {
        await supabaseAdmin
          .from("suppliers")
          .update({
            rating: Math.max(newData.supplier.rating, existing.rating),
            review_count: Math.max(newData.supplier.review_count, existing.review_count),
          })
          .eq("id", existingId);
      }
    }
  }

  // Add new products that don't exist
  if (newData.products && newData.products.length > 0) {
    const { data: existingProducts } = await supabaseAdmin
      .from("products")
      .select("name")
      .eq("supplier_id", existingId);

    const existingProductNames = new Set(
      (existingProducts || []).map((p) => p.name.toLowerCase())
    );

    const newProducts = newData.products.filter(
      (p) => !existingProductNames.has(p.name.toLowerCase())
    );

    if (newProducts.length > 0) {
      await supabaseAdmin.from("products").insert(
        newProducts.map((p) => ({
          ...p,
          supplier_id: existingId,
        }))
      );
    }
  }

  // Add new certifications
  if (newData.certifications && newData.certifications.length > 0) {
    const { data: existingCerts } = await supabaseAdmin
      .from("certifications")
      .select("certification_type")
      .eq("supplier_id", existingId);

    const existingCertTypes = new Set(
      (existingCerts || []).map((c) => c.certification_type.toLowerCase())
    );

    const newCerts = newData.certifications.filter(
      (c) => !existingCertTypes.has(c.certification_type.toLowerCase())
    );

    if (newCerts.length > 0) {
      await supabaseAdmin.from("certifications").insert(
        newCerts.map((c) => ({
          ...c,
          supplier_id: existingId,
        }))
      );
    }
  }
}



