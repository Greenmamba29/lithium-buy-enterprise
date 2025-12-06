# LithiumBuy Enterprise API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: `https://lithiumbuy.com`

## Authentication

Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

## Health Check

### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "lithiumbuy-api"
}
```

### GET /ready
Readiness check with dependency status.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "dependencies": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" },
    "external_apis": {
      "daily": { "status": "healthy" },
      "perplexity": { "status": "configured" },
      "gemini": { "status": "configured" },
      "docusign": { "status": "configured" }
    }
  }
}
```

## Suppliers

### GET /api/suppliers
List suppliers with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `verification_tier` (string): gold, silver, or bronze
- `country` (string): Filter by country
- `product_type` (string): Filter by product type

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Supplier Name",
      "logo_url": "https://...",
      "verification_tier": "gold",
      "rating": 4.5,
      "review_count": 120
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /api/suppliers/:id
Get supplier details.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Supplier Name",
    "logo_url": "https://...",
    "verification_tier": "gold",
    "rating": 4.5,
    "review_count": 120,
    "profile": {
      "description": "...",
      "website": "https://...",
      "contact_email": "contact@supplier.com"
    },
    "products": [...],
    "locations": [...]
  }
}
```

### GET /api/suppliers/:id/products
Get supplier products.

### GET /api/suppliers/:id/reviews
Get supplier reviews with pagination.

## Quotes

### POST /api/suppliers/:id/quote
Create a quote request.

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 100,
  "delivery_location": "United States",
  "notes": "Urgent delivery required"
}
```

### GET /api/quotes
Get user's quotes.

### GET /api/quotes/:id
Get quote details.

### POST /api/quotes/:id/accept
Accept a quote and create an order.

## Auctions

### GET /api/auctions
List active auctions.

**Query Parameters:**
- `status` (string): scheduled, live, ended
- `auction_type` (string): english, dutch, sealed_bid, reverse
- `page` (number)
- `limit` (number)

### POST /api/auctions
Create a new auction. (Requires authentication)

**Request Body:**
```json
{
  "title": "Lithium Carbonate 99.5% - 100 tons",
  "description": "...",
  "auction_type": "english",
  "starting_price": 50000,
  "currency": "USD",
  "start_time": "2024-01-01T10:00:00Z",
  "end_time": "2024-01-01T18:00:00Z",
  "lots": [
    {
      "product_type": "compound",
      "purity_level": "99.5",
      "quantity": 100,
      "unit": "ton"
    }
  ]
}
```

### GET /api/auctions/:id
Get auction details with bids.

### POST /api/auctions/:id/bid
Place a bid. (Requires authentication)

**Request Body:**
```json
{
  "amount": 55000,
  "currency": "USD"
}
```

### POST /api/auctions/:id/end
End an auction. (Requires seller or admin)

## RFQ (Request for Quote)

### GET /api/rfq
List RFQs.

**Query Parameters:**
- `status` (string): draft, published, awarded
- `product_type` (string)
- `page` (number)
- `limit` (number)

### POST /api/rfq
Create a new RFQ. (Requires authentication)

**Request Body:**
```json
{
  "title": "Lithium Carbonate 99.5% - 100 tons",
  "description": "...",
  "product_type": "compound",
  "purity_level": "99.5",
  "quantity": 100,
  "unit": "ton",
  "target_price": 50000,
  "currency": "USD",
  "delivery_location_country": "United States",
  "deadline": "2024-01-15T00:00:00Z"
}
```

### GET /api/rfq/:id
Get RFQ details with responses.

### POST /api/rfq/:id/publish
Publish an RFQ. (Requires buyer)

### POST /api/rfq/:id/response
Submit RFQ response. (Requires supplier)

**Request Body:**
```json
{
  "supplier_id": "uuid",
  "quote_price": 52000,
  "currency": "USD",
  "delivery_time_days": 14,
  "payment_terms": "Net 30",
  "notes": "..."
}
```

### GET /api/rfq/:id/responses
Get RFQ responses. (Requires buyer)

### POST /api/rfq/:id/award
Award RFQ to a supplier. (Requires buyer)

**Request Body:**
```json
{
  "response_id": "uuid"
}
```

## Contracts

### GET /api/contracts
List contracts.

### GET /api/contracts/:id
Get contract details.

### POST /api/rfq/:id/contract
Create contract from awarded RFQ.

## Market Intelligence (Perplexity)

### GET /api/perplexity/prices
Get real-time lithium prices.

**Query Parameters:**
- `product_type` (string)
- `purity_level` (string)
- `location` (string)
- `days` (number): Historical data days

### GET /api/perplexity/news
Get market news with sentiment analysis.

### GET /api/perplexity/arbitrage
Get arbitrage opportunities.

**Query Parameters:**
- `minProfit` (number)
- `status` (string): active, expired, executed

### GET /api/perplexity/briefing
Get daily market briefing.

**Query Parameters:**
- `date` (string): YYYY-MM-DD

## TELEBUY Sessions

### POST /api/telebuy/sessions
Create a TELEBUY session. (Requires authentication)

**Request Body:**
```json
{
  "supplier_id": "uuid",
  "scheduled_at": "2024-01-01T10:00:00Z",
  "notes": "Discussion about pricing"
}
```

### GET /api/telebuy/sessions
Get user's TELEBUY sessions.

**Query Parameters:**
- `status` (string): scheduled, in-progress, completed

### GET /api/telebuy/sessions/:id
Get session details with meeting URL and token.

### POST /api/telebuy/sessions/:id/start
Start a session.

### POST /api/telebuy/sessions/:id/end
End a session.

**Request Body:**
```json
{
  "recording_url": "https://...",
  "transcript": "...",
  "notes": "..."
}
```

## Admin Dashboard

All admin endpoints require `admin` role.

### GET /api/admin/dashboard
Get complete dashboard data.

### GET /api/admin/dashboard/kpis
Get real-time KPIs.

### GET /api/admin/dashboard/prices
Get price intelligence data.

### GET /api/admin/dashboard/auctions
Get auction metrics.

### GET /api/admin/dashboard/procurement
Get procurement statistics.

### GET /api/admin/dashboard/arbitrage
Get arbitrage summary.

### GET /api/admin/dashboard/insights
Get industry insights.

### GET /api/admin/dashboard/news
Get recent market news.

## Content Generation

### POST /api/content/generate
Generate AI content. (Requires authentication)

**Request Body:**
```json
{
  "content_type": "blog",
  "title": "Lithium Market Trends 2024",
  "source_data": {
    "keywords": ["lithium", "battery", "EV"],
    "market_data": {...}
  },
  "metadata": {
    "author": "LithiumBuy AI",
    "tags": ["market-analysis"]
  }
}
```

### GET /api/content
List generated content.

### GET /api/content/:id
Get content details.

### POST /api/content/:id/status
Update content status.

**Request Body:**
```json
{
  "status": "published"
}
```

### POST /api/content/:id/publish
Publish content to external platform.

**Request Body:**
```json
{
  "platform": "medium"
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "error": true,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "transient": false
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable
