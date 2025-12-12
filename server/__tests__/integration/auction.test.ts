import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { supabaseAdmin } from "../../db/client.js";
import {
  createAuction,
  placeBid,
  getAuctionById,
  listActiveAuctions,
  endAuction,
  updateAuctionStatus,
} from "../../services/auctionService.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

/**
 * Integration tests for Auction Service
 * Tests auction creation, bidding, and winner determination
 */

describe("Auction Service Integration Tests", () => {
  // Test data IDs for cleanup
  let testAuctionId: string | null = null;
  let testSellerId: string | null = null;
  let testBidderId: string | null = null;

  // Setup: Create test users before all tests
  beforeAll(async () => {
    // For integration tests, we would typically use test users
    // In production tests, use a test database or seeded users
    // Here we'll use mock UUIDs for structure validation
    testSellerId = "11111111-1111-1111-1111-111111111111";
    testBidderId = "22222222-2222-2222-2222-222222222222";
  });

  // Cleanup after each test
  afterEach(async () => {
    if (testAuctionId) {
      // Delete bids first due to foreign key constraints
      await supabaseAdmin.from("bids").delete().eq("auction_id", testAuctionId);
      await supabaseAdmin.from("auction_lots").delete().eq("auction_id", testAuctionId);
      await supabaseAdmin.from("auctions").delete().eq("id", testAuctionId);
      testAuctionId = null;
    }
  });

  describe("Auction Creation", () => {
    it("should create auction with lots successfully", async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const auctionInput = {
        seller_id: testSellerId!,
        title: "Test Lithium Auction",
        description: "Premium lithium carbonate lot for testing",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        reserve_price: 50000,
        starting_price: 10000,
        currency: "USD",
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Lithium Carbonate Lot A",
            description: "High purity lithium carbonate",
            quantity: 100,
            unit: "ton",
            product_type: "compound" as const,
            purity_level: "99.5" as const,
            location_country: "Chile",
            location_city: "Antofagasta",
          },
        ],
      };

      const auction = await createAuction(auctionInput);
      testAuctionId = auction.id;

      expect(auction).toBeDefined();
      expect(auction.id).toBeDefined();
      expect(auction.title).toBe("Test Lithium Auction");
      expect(auction.status).toBe("scheduled");
      expect(auction.current_bid).toBe(10000);
      expect(auction.lots).toHaveLength(1);
      expect(auction.lots[0].lot_number).toBe(1);
    });

    it("should reject auction with end_time before start_time", async () => {
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 1 * 60 * 60 * 1000);

      const auctionInput = {
        seller_id: testSellerId!,
        title: "Invalid Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      };

      await expect(createAuction(auctionInput)).rejects.toThrow(ValidationError);
    });

    it("should reject auction with start_time in the past", async () => {
      const startTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auctionInput = {
        seller_id: testSellerId!,
        title: "Past Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      };

      await expect(createAuction(auctionInput)).rejects.toThrow(ValidationError);
    });
  });

  describe("Auction Listing", () => {
    it("should list active auctions with pagination", async () => {
      // Create a test auction first
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Listable Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      const result = await listActiveAuctions({
        limit: 10,
        offset: 0,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(typeof result.total).toBe("number");
    });

    it("should filter auctions by type", async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Dutch Auction Test",
        auction_type: "dutch" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      const result = await listActiveAuctions({
        auction_type: "dutch",
        limit: 10,
        offset: 0,
      });

      expect(result.data.every((a: any) => a.auction_type === "dutch")).toBe(true);
    });
  });

  describe("Auction Detail Retrieval", () => {
    it("should get auction by ID with lots and bids", async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Detail Test Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
            product_type: "raw" as const,
          },
        ],
      });
      testAuctionId = auction.id;

      const retrieved = await getAuctionById(testAuctionId);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(testAuctionId);
      expect(retrieved.title).toBe("Detail Test Auction");
      expect(retrieved.auction_lots).toBeInstanceOf(Array);
      expect(retrieved.bids).toBeInstanceOf(Array);
    });

    it("should throw NotFoundError for non-existent auction", async () => {
      const fakeId = "99999999-9999-9999-9999-999999999999";

      await expect(getAuctionById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe("Bid Placement", () => {
    it("should reject bid on non-live auction", async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Scheduled Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      // Auction is scheduled, not live
      await expect(placeBid(testAuctionId, testBidderId!, 11000)).rejects.toThrow(
        "Auction is not currently live"
      );
    });

    it("should reject bid below minimum increment", async () => {
      const startTime = new Date(Date.now() - 60 * 1000); // Started 1 minute ago
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create and manually set to live
      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Live Auction",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      // Set to live status manually
      await updateAuctionStatus(testAuctionId, "live");

      // Try to place a bid that's too low (current + increment = 10500 minimum)
      await expect(placeBid(testAuctionId, testBidderId!, 10200)).rejects.toThrow(
        /Bid must be at least/
      );
    });

    it("should reject seller bidding on own auction", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Self Bid Test",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      // Seller tries to bid on their own auction
      await expect(placeBid(testAuctionId, testSellerId!, 11000)).rejects.toThrow(
        "Seller cannot bid on their own auction"
      );
    });

    it("should place valid bid and update auction", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Valid Bid Test",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      // Place valid bid
      const result = await placeBid(testAuctionId, testBidderId!, 11000);

      expect(result).toBeDefined();
      expect(result.bid).toBeDefined();
      expect(result.bid.amount).toBe(11000);
      expect(result.bid.is_winning).toBe(true);
      expect(result.auction.current_bid).toBe(11000);
    });
  });

  describe("Auction Status Management", () => {
    it("should update auction status", async () => {
      const startTime = new Date(Date.now() + 60 * 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Status Update Test",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      const updated = await updateAuctionStatus(testAuctionId, "live");

      expect(updated.status).toBe("live");
    });
  });

  describe("Auction Ending", () => {
    it("should end auction without bids", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "End Without Bids",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      const ended = await endAuction(testAuctionId);

      expect(ended.status).toBe("ended");
      expect(ended.winner_id).toBeNull();
    });

    it("should end auction with winner when reserve is met", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "End With Winner",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        reserve_price: 15000,
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      // Place winning bid above reserve
      await placeBid(testAuctionId, testBidderId!, 16000);

      const ended = await endAuction(testAuctionId);

      expect(ended.status).toBe("ended");
      expect(ended.winner_id).toBe(testBidderId);
    });

    it("should end auction without winner when reserve is not met", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Reserve Not Met",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        reserve_price: 50000,
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      // Place bid below reserve
      await placeBid(testAuctionId, testBidderId!, 15000);

      const ended = await endAuction(testAuctionId);

      expect(ended.status).toBe("ended");
      expect(ended.winner_id).toBeNull(); // Reserve not met
    });

    it("should reject ending already ended auction", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Already Ended",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");
      await endAuction(testAuctionId);

      // Try to end again
      await expect(endAuction(testAuctionId)).rejects.toThrow(
        "Auction has already ended"
      );
    });
  });

  describe("Concurrent Bidding", () => {
    it("should handle sequential bids correctly", async () => {
      const startTime = new Date(Date.now() - 60 * 1000);
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const auction = await createAuction({
        seller_id: testSellerId!,
        title: "Sequential Bids Test",
        auction_type: "english" as const,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        starting_price: 10000,
        bid_increment: 500,
        lots: [
          {
            lot_number: 1,
            title: "Test Lot",
            quantity: 50,
          },
        ],
      });
      testAuctionId = auction.id;

      await updateAuctionStatus(testAuctionId, "live");

      // First bid
      const bid1 = await placeBid(testAuctionId, testBidderId!, 10500);
      expect(bid1.bid.is_winning).toBe(true);

      // Second bid by different user (using seller ID as second bidder for test)
      const secondBidderId = "33333333-3333-3333-3333-333333333333";
      const bid2 = await placeBid(testAuctionId, secondBidderId, 11000);
      expect(bid2.bid.is_winning).toBe(true);

      // Verify first bid is no longer winning
      const auctionState = await getAuctionById(testAuctionId);
      const winningBids = auctionState.bids.filter((b: any) => b.is_winning);
      expect(winningBids.length).toBe(1);
      expect(winningBids[0].bidder_id).toBe(secondBidderId);
    });
  });
});
