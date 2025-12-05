import { z } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Supplier data validation schemas
 */

export const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  logo_url: z.string().url().nullable().optional(),
  verification_tier: z.enum(["gold", "silver", "bronze"]),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().int().min(0).default(0),
  transaction_count: z.number().int().min(0).default(0),
  response_time: z.string().nullable().optional(),
  years_in_business: z.number().int().positive().nullable().optional(),
});

export const supplierProfileSchema = z.object({
  description: z.string().max(5000).nullable().optional(),
  website: z.string().url().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  specialties: z.array(z.string()).nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  product_type: z.enum(["raw", "compound", "processed"]),
  purity_level: z.enum(["99", "99.5", "99.9"]),
  price_per_unit: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  unit: z.string().min(1).max(20).default("ton"),
  min_order_quantity: z.number().int().positive().nullable().optional(),
  availability: z.enum(["in-stock", "limited", "contact"]),
  has_bulk_discount: z.boolean().default(false),
  bulk_discount_threshold: z.number().int().positive().nullable().optional(),
  bulk_discount_percentage: z.number().min(0).max(100).nullable().optional(),
});

/**
 * Validate supplier data
 */
export function validateSupplier(data: unknown): z.infer<typeof supplierSchema> {
  try {
    return supplierSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Supplier validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}

/**
 * Validate supplier profile
 */
export function validateSupplierProfile(data: unknown): z.infer<typeof supplierProfileSchema> {
  try {
    return supplierProfileSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Supplier profile validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}

/**
 * Validate product data
 */
export function validateProduct(data: unknown): z.infer<typeof productSchema> {
  try {
    return productSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Product validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }
    throw error;
  }
}



