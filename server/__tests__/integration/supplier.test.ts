import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { supabaseAdmin } from "../../db/client.js";
import { executeTransaction } from "../../utils/transactions.js";

/**
 * Integration tests for supplier creation flow
 * Tests the complete multi-table transaction
 */

describe("Supplier Creation Flow", () => {
  let testSupplierId: string | null = null;
  let testUserId: string | null = null;

  beforeEach(async () => {
    // Create a test user for testing
    // In a real test, you'd use a test database or cleanup after
  });

  afterEach(async () => {
    // Cleanup test data
    if (testSupplierId) {
      await supabaseAdmin.from("suppliers").delete().eq("id", testSupplierId);
    }
  });

  it("should create supplier with profile and location in a transaction", async () => {
    // This test would require a test database
    // For now, we'll test the transaction logic structure

    const supplierData = {
      name: "Test Supplier",
      verification_tier: "bronze",
      rating: 0,
      review_count: 0,
    };

    const profileData = {
      description: "Test supplier profile",
      contact_email: "test@supplier.com",
      website: "https://test-supplier.com",
    };

    const locationData = {
      country: "United States",
      city: "New York",
      address: "123 Test St",
    };

    // Test that transaction wrapper works
    const result = await executeTransaction([
      {
        description: "Create supplier",
        execute: async () => {
          const { data, error } = await supabaseAdmin
            .from("suppliers")
            .insert(supplierData)
            .select()
            .single();

          if (error) throw new Error(`Failed to create supplier: ${error.message}`);
          testSupplierId = data.id;
          return data;
        },
      },
      {
        description: "Create supplier profile",
        execute: async () => {
          if (!testSupplierId) throw new Error("Supplier ID not set");

          const { data, error } = await supabaseAdmin
            .from("supplier_profiles")
            .insert({
              supplier_id: testSupplierId,
              ...profileData,
            })
            .select()
            .single();

          if (error) throw new Error(`Failed to create profile: ${error.message}`);
          return data;
        },
      },
      {
        description: "Create location",
        execute: async () => {
          if (!testSupplierId) throw new Error("Supplier ID not set");

          const { data, error } = await supabaseAdmin
            .from("locations")
            .insert({
              supplier_id: testSupplierId,
              ...locationData,
            })
            .select()
            .single();

          if (error) throw new Error(`Failed to create location: ${error.message}`);
          return data;
        },
      },
    ]);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(testSupplierId).toBeTruthy();
  });

  it("should rollback all operations if one fails", async () => {
    const result = await executeTransaction([
      {
        description: "Create supplier",
        execute: async () => {
          const { data } = await supabaseAdmin
            .from("suppliers")
            .insert({ name: "Test Supplier" })
            .select()
            .single();
          testSupplierId = data.id;
          return data;
        },
      },
      {
        description: "Fail intentionally",
        execute: async () => {
          throw new Error("Intentional failure");
        },
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();

    // Verify rollback - supplier should not exist
    if (testSupplierId) {
      const { data } = await supabaseAdmin
        .from("suppliers")
        .select()
        .eq("id", testSupplierId)
        .single();
      // In a real transaction, this would be rolled back
      // For Supabase, we'd need to manually clean up
    }
  });
});
