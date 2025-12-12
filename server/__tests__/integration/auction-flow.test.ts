/**
 * Integration Tests for PRD Auction Flow
 * Tests complete auction lifecycle: creation → bidding → closure
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createAuction, placeBid, closeAuction, launchAuction } from "../../services/auctionService.js";
import { getBidHistory } from "../../services/bidHistoryService.js";

describe("PRD Auction Flow Integration Tests", () => {
  const testSellerId = "test-seller-id";
  const testBuyerId = "test-buyer-id";

  describe("Auction Creation", () => {
    it("should create auction with PRD fields", async () => {
      const auction = await createAuction({
        seller_id: testSellerId,
        title: "Test Lithium Carbonate Auction",
        description: "Test auction for integration testing",
        auction_type: "english",
        material_type: "Carbonate",
        grade: "99.5",
        quantity_total: 100,
        delivery_incoterms: "CIF",
        delivery_port: "Los Angeles",
        delivery_date: "2025-12-31",
        starting_price: 50000,
        scheduled_start: new Date(Date.now() + 60000).toISOString(), // 1 min from now
        scheduled_end: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        status: "draft",
      });

      expect(auction).toBeDefined();
      expect(auction.auction_number).toMatch(/^AU-\d{8}-\d{3}$/);
      expect(auction.material_type).toBe("Carbonate");
      expect(auction.grade).toBe("99.5");
      expect(auction.quantity_total).toBe(100);
      expect(auction.quantity_remaining).toBe(100);
      expect(auction.delivery_incoterms).toBe("CIF");
      expect(auction.verification_status).toBe("pending");
    });

    it("should generate unique auction numbers", async () => {
      const auction1 = await createAuction({
        seller_id: testSellerId,
        title: "Auction 1",
        auction_type: "english",
        material_type: "Hydroxide",
        grade: "99",
        quantity_total: 50,
        delivery_incoterms: "FOB",
        starting_price: 40000,
        scheduled_start: new Date(Date.now() + 60000).toISOString(),
        scheduled_end: new Date(Date.now() + 3600000).toISOString(),
        status: "draft",
      });

      const auction2 = await createAuction({
        seller_id: testSellerId,
        title: "Auction 2",
        auction_type: "english",
        material_type: "Spodumene",
        grade: "99.9",
        quantity_total: 75,
        delivery_incoterms: "DDP",
        starting_price: 45000,
        scheduled_start: new Date(Date.now() + 60000).toISOString(),
        scheduled_end: new Date(Date.now() + 3600000).toISOString(),
        status: "draft",
      });

      expect(auction1.auction_number).not.toBe(auction2.auction_number);
    });
  });

  describe("Auction Lifecycle", () => {
    it("should launch auction from draft to active", async () => {
      const auction = await createAuction({
        seller_id: testSellerId,
        title: "Test Launch Auction",
        auction_type: "english",
        material_type: "Carbonate",
        grade: "99.5",
        quantity_total: 100,
        delivery_incoterms: "CIF",
        starting_price: 50000,
        scheduled_start: new Date(Date.now() + 60000).toISOString(),
        scheduled_end: new Date(Date.now() + 3600000).toISOString(),
        status: "draft",
      });

      const launched = await launchAuction(auction.id);
      expect(launched.status).toBe("active");
    });
  });

  describe("Bidding with Bid History", () => {
    it("should place bid and record in bid history", async () => {
      const auction = await createAuction({
        seller_id: testSellerId,
        title: "Test Bidding Auction",
        auction_type: "english",
        material_type: "Carbonate",
        grade: "99.5",
        quantity_total: 100,
        delivery_incoterms: "CIF",
        starting_price: 50000,
        scheduled_start: new Date(Date.now() + 60000).toISOString(),
        scheduled_end: new Date(Date.now() + 3600000).toISOString(),
        status: "active",
        launch_now: true,
      });

      const bidResult = await placeBid(auction.id, testBuyerId, 51000, {
        ipAddress: "192.168.1.1",
        userAgent: "test-agent",
      });

      expect(bidResult.bid).toBeDefined();
      expect(bidResult.rank).toBeGreaterThan(0);

      // Check bid history
      const history = await getBidHistory(auction.id);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].status_change).toBe("placed");
    });
  });

  describe("Auction Closure", () => {
    it("should close auction and determine winner", async () => {
      const auction = await createAuction({
        seller_id: testSellerId,
        title: "Test Closure Auction",
        auction_type: "english",
        material_type: "Carbonate",
        grade: "99.5",
        quantity_total: 100,
        delivery_incoterms: "CIF",
        starting_price: 50000,
        scheduled_start: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
        scheduled_end: new Date(Date.now() - 60000).toISOString(), // Ended 1 min ago
        status: "active",
      });

      // Place a bid
      await placeBid(auction.id, testBuyerId, 51000);

      // Close auction
      const closed = await closeAuction(auction.id);
      expect(closed.status).toBe("closed");
      expect(closed.winning_buyer_id).toBe(testBuyerId);
      expect(closed.final_price).toBe(51000);
    });
  });
});

