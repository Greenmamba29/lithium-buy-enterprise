# Framework: Real-time Auction Bid Engine v1

## Overview

| Property | Value |
|----------|-------|
| **Name** | Real-time Auction Bid Engine v1 |
| **Code Namespace** | `server/services/auctionService.ts`; `server/services/websocketService.ts`; `server/routes/auctions.ts`; `client/src/hooks/useRealtimeAuction.ts`; `client/src/components/AuctionTimer.tsx`; `client/src/components/BidForm.tsx` |
| **Domain** | Auctions; Market Structure |
| **Level** | Algorithm |
| **Version** | v1 |
| **Status** | In Dev → Live when production tested |
| **Owner** | Claudius Gothicus |

## Problem It Solves

Manages real-time bidding, price discovery, and winner selection for lithium auctions while handling concurrency, fairness, and auditability across web and API clients.

## Inputs

- **Auction definitions**: start/end time, reserve price, lot size
- **Incoming bids**: price, volume, bidder metadata
- **Time events**: closing, extension rules

## Outputs

- Accepted/rejected bid events
- Updated leading price
- Final auction result (winner + clearing price)
- Persistent bid history for audit

## Key Decisions

1. **Tie Breaking**: First bid at price level wins (timestamp-based)
2. **Late Bid Handling**: Bids after end_time are rejected with ValidationError
3. **Client Update Frequency**: Every 5 seconds (polling) + real-time WebSocket for immediate bid notifications
4. **Invalid Bid Prevention**:
   - Bid must exceed `current_bid + bid_increment`
   - Seller cannot bid on their own auction
   - Only live auctions accept bids
5. **Auction States**: `draft` → `scheduled` → `live` → `ended`/`cancelled`
6. **Double-Spending Prevention**: Transaction-based bid placement with rollback support

## Related Tables

| Table | Purpose |
|-------|---------|
| `auctions` | Main auction metadata (seller, timing, pricing, status) |
| `auction_lots` | Individual items/lots within an auction |
| `bids` | All bid records with winning status tracking |
| `escrow_accounts` | Payment escrow for completed auctions |
| `logistics_options` | Shipping options for auction fulfillment |

## Related Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auctions` | GET | List active auctions with filters |
| `/api/auctions` | POST | Create new auction (auth required) |
| `/api/auctions/:id` | GET | Get auction details with lots and bids |
| `/api/auctions/:id/bid` | POST | Place bid (auth required) |
| `/api/auctions/:id/end` | POST | End auction (seller/admin only) |
| `/api/auctions/:id/status` | POST | Update auction status |
| WebSocket `/ws` | - | Real-time auction updates (`auction:{id}` channel) |

## UX Touchpoints

- **Auctions list page** (`/auctions`): Grid of auction cards with filters
- **Auction detail page** (`/auctions/:id`): Full auction info, lot details, bid history
- **Live bid panel**: Real-time current bid display
- **Auction timer**: Countdown showing time remaining
- **Bid form**: Quick bid buttons, validation feedback

## Architecture

### Backend Flow

```
┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  Express Route  │────▶│  Auction Service   │────▶│    Supabase     │
│ (auctions.ts)   │     │ (auctionService.ts)│     │  (PostgreSQL)   │
└─────────────────┘     └────────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌────────────────────┐
        │               │  WebSocket Manager │
        │               │ (websocketService) │
        └──────────────▶└────────────────────┘
                                 │
                                 ▼
                        ┌────────────────────┐
                        │  Connected Clients │
                        │   (Real-time)      │
                        └────────────────────┘
```

### Frontend Flow

```
┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  Auctions Page  │────▶│   React Query      │────▶│   API Request   │
│ (Auctions.tsx)  │     │   (useQuery)       │     │ (/api/auctions) │
└─────────────────┘     └────────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌────────────────────┐
        │               │ useRealtimeAuction │
        │               │    (WebSocket)     │
        └──────────────▶└────────────────────┘
```

### Database Schema

```sql
-- Core auction table
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  auction_type TEXT CHECK (auction_type IN ('english', 'dutch', 'sealed_bid', 'reverse')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reserve_price DECIMAL(12, 2),
  starting_price DECIMAL(12, 2) NOT NULL,
  bid_increment DECIMAL(12, 2) NOT NULL DEFAULT 100.00,
  current_bid DECIMAL(12, 2),
  winner_id UUID REFERENCES auth.users(id)
);

-- Bids table with winning tracking
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES auctions(id),
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(12, 2) NOT NULL,
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Service Functions

### `auctionService.ts`

| Function | Purpose |
|----------|---------|
| `createAuction(input)` | Creates auction + lots atomically with transaction |
| `placeBid(auctionId, bidderId, amount)` | Validates and places bid, updates current_bid |
| `getAuctionById(id)` | Retrieves auction with lots and bidder profiles |
| `listActiveAuctions(filters)` | Lists scheduled/live auctions with pagination |
| `endAuction(id)` | Determines winner, respects reserve price |
| `updateAuctionStatus(id, status)` | Updates auction state |

### Validation Rules

```typescript
// Bid validation in placeBid()
if (auction.status !== "live") throw new ValidationError("Auction is not currently live");
if (now < startTime) throw new ValidationError("Auction has not started yet");
if (now >= endTime) throw new ValidationError("Auction has ended");
if (amount <= auction.current_bid) throw new ValidationError(`Bid must be higher than current bid`);
if (amount < minBid) throw new ValidationError(`Bid must be at least ${minBid}`);
if (bidderId === auction.seller_id) throw new ValidationError("Seller cannot bid on their own auction");
```

## RLS Policies

```sql
-- Auctions: Public read, authenticated write for own auctions
CREATE POLICY "Auctions are viewable by everyone" ON auctions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create auctions" ON auctions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = seller_id);

-- Bids: Restricted visibility, authenticated insert for live auctions
CREATE POLICY "Users can view bids for auctions they're in" ON bids FOR SELECT
  USING (bidder_id = auth.uid() OR /* seller */ OR /* auction is live/ended */);
CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = bidder_id
    AND /* auction is live */ AND /* not seller */);
```

## Testing

Integration tests are located at: `server/__tests__/integration/auction.test.ts`

### Test Coverage

- Auction creation with lots
- Validation of time constraints
- Auction listing and filtering
- Bid placement validation
- Seller self-bid prevention
- Sequential bid handling
- Auction ending with/without winner
- Reserve price enforcement

### Running Tests

```bash
npm test -- --grep "Auction"
```

## IP Notes

Custom bid-handling and settlement rules form the basis for a proprietary marketplace mechanism; a candidate for patentable design in B2B lithium trading.

## Future Enhancements

- [ ] Auction extension rules (anti-sniping)
- [ ] Dutch auction price decrement automation
- [ ] Sealed bid reveal mechanism
- [ ] Multi-lot bidding support
- [ ] Bid proxy/maximum bid functionality
- [ ] Admin dashboard for auction management
- [ ] Rate limiting on bid placement
