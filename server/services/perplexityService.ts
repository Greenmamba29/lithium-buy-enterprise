import { supabaseAdmin } from "../db/client.js";
import { logger } from "../utils/logger.js";
import { ValidationError } from "../utils/errors.js";
import { perplexityCircuitBreaker, CircuitBreakerError } from "../utils/circuitBreaker.js";

/**
 * Perplexity Labs API Service
 * 
 * Provides real-time price aggregation, news sentiment analysis,
 * arbitrage detection, and market intelligence reports.
 */

interface PerplexityPriceData {
  product_type: "raw" | "compound" | "processed";
  purity_level: "99" | "99.5" | "99.9";
  price: number;
  currency: string;
  location?: {
    country: string;
    city?: string;
  };
  source: string;
  timestamp: Date;
}

interface PerplexityNewsItem {
  title: string;
  content: string;
  url: string;
  source: string;
  published_at: Date;
  sentiment_score?: number;
}

interface ArbitrageOpportunity {
  product_type: "raw" | "compound" | "processed";
  purity_level: "99" | "99.5" | "99.9";
  buy_location: { country: string; city?: string };
  buy_price: number;
  sell_location: { country: string; city?: string };
  sell_price: number;
  quantity_available?: number;
  estimated_profit: number;
  profit_margin: number;
  logistics_cost?: number;
}

/**
 * Get Perplexity API configuration
 */
function getPerplexityConfig() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  const model = process.env.PERPLEXITY_MODEL || "sonar-pro";
  const baseUrl = "https://api.perplexity.ai";

  if (!apiKey) {
    throw new ValidationError("PERPLEXITY_API_KEY environment variable is required");
  }

  return { apiKey, model, baseUrl };
}

/**
 * Fetch real-time lithium prices from Perplexity Sonar Pro
 */
export async function fetchLithiumPrices(
  filters?: {
    productType?: "raw" | "compound" | "processed";
    purityLevel?: "99" | "99.5" | "99.9";
    location?: string;
  }
): Promise<PerplexityPriceData[]> {
  const { apiKey, model, baseUrl } = getPerplexityConfig();

  return perplexityCircuitBreaker.execute(async () => {
    try {
      const query = buildPriceQuery(filters);
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
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
            content: "You are a lithium market data expert. Extract structured price data from your knowledge and return JSON format.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from Perplexity API");
    }

    // Parse JSON response (may be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    const prices = JSON.parse(jsonContent);

    return Array.isArray(prices) ? prices : [prices];
    } catch (error) {
      if (error instanceof CircuitBreakerError) {
        throw error;
      }
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          filters,
        },
        "Failed to fetch lithium prices from Perplexity"
      );
      throw error;
    }
  });
}

/**
 * Build price query for Perplexity
 */
function buildPriceQuery(filters?: {
  productType?: "raw" | "compound" | "processed";
  purityLevel?: "99" | "99.5" | "99.9";
  location?: string;
}): string {
  let query = "What are the current spot prices for lithium";

  if (filters?.productType) {
    query += ` ${filters.productType}`;
  }

  if (filters?.purityLevel) {
    query += ` with ${filters.purityLevel}% purity`;
  }

  if (filters?.location) {
    query += ` in ${filters.location}`;
  }

  query += "? Return as JSON array with fields: product_type, purity_level, price, currency, location (country, city), source, timestamp. Include multiple sources and locations.";

  return query;
}

/**
 * Analyze market news sentiment using Perplexity
 */
export async function analyzeNewsSentiment(
  newsItems: Array<{ title: string; content: string; url: string }>
): Promise<Array<PerplexityNewsItem & { sentiment_score: number; sentiment_label: string }>> {
  const { apiKey, model, baseUrl } = getPerplexityConfig();

  try {
    const results = [];

    for (const news of newsItems) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
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
              content: "You are a financial news sentiment analyst. Analyze the sentiment of lithium market news and return a sentiment score from -100 (very negative) to 100 (very positive), and a label.",
            },
            {
              role: "user",
              content: `Analyze this news article about lithium:\n\nTitle: ${news.title}\n\nContent: ${news.content}\n\nReturn JSON with: sentiment_score (number -100 to 100), sentiment_label (very_negative, negative, neutral, positive, very_positive)`,
            },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        logger.warn({ url: news.url }, "Failed to analyze news sentiment");
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : content;
        const sentiment = JSON.parse(jsonContent);

        results.push({
          ...news,
          sentiment_score: sentiment.sentiment_score || 0,
          sentiment_label: sentiment.sentiment_label || "neutral",
        });
      }
    }

    return results;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to analyze news sentiment"
    );
    throw error;
  }
}

/**
 * Detect arbitrage opportunities using price data
 */
export async function detectArbitrageOpportunities(
  priceData: PerplexityPriceData[]
): Promise<ArbitrageOpportunity[]> {
  const opportunities: ArbitrageOpportunity[] = [];

  try {
    // Group prices by product type and purity
    const priceGroups = new Map<string, PerplexityPriceData[]>();

    for (const price of priceData) {
      const key = `${price.product_type}-${price.purity_level}`;
      if (!priceGroups.has(key)) {
        priceGroups.set(key, []);
      }
      priceGroups.get(key)!.push(price);
    }

    // Find price discrepancies
    for (const [key, prices] of priceGroups.entries()) {
      if (prices.length < 2) continue;

      const [productType, purityLevel] = key.split("-") as ["raw" | "compound" | "processed", "99" | "99.5" | "99.9"];

      // Compare all price pairs
      for (let i = 0; i < prices.length; i++) {
        for (let j = i + 1; j < prices.length; j++) {
          const buyPrice = prices[i];
          const sellPrice = prices[j];

          // Ensure same currency for comparison
          if (buyPrice.currency !== sellPrice.currency) continue;

          const priceDiff = sellPrice.price - buyPrice.price;
          const profitMargin = (priceDiff / buyPrice.price) * 100;

          // Only consider opportunities with >5% profit margin
          if (profitMargin > 5) {
            // Estimate logistics cost (simplified - 2% of buy price)
            const estimatedLogisticsCost = buyPrice.price * 0.02;
            const netProfit = priceDiff - estimatedLogisticsCost;

            if (netProfit > 0) {
              opportunities.push({
                product_type: productType,
                purity_level: purityLevel,
                buy_location: {
                  country: buyPrice.location?.country || "Unknown",
                  city: buyPrice.location?.city,
                },
                buy_price: buyPrice.price,
                sell_location: {
                  country: sellPrice.location?.country || "Unknown",
                  city: sellPrice.location?.city,
                },
                sell_price: sellPrice.price,
                estimated_profit: netProfit,
                profit_margin: profitMargin,
                logistics_cost: estimatedLogisticsCost,
              });
            }
          }
        }
      }
    }

    // Sort by profit margin descending
    opportunities.sort((a, b) => b.profit_margin - a.profit_margin);

    return opportunities;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to detect arbitrage opportunities"
    );
    throw error;
  }
}

/**
 * Generate daily market briefing
 */
export async function generateDailyBriefing(): Promise<{
  summary: string;
  key_highlights: any;
  price_summary: any;
  news_summary: any;
  arbitrage_opportunities: any;
}> {
  const { apiKey, model, baseUrl } = getPerplexityConfig();

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
            content: "You are a lithium market intelligence analyst. Generate comprehensive daily market briefings with structured data.",
          },
          {
            role: "user",
            content: `Generate a comprehensive daily market briefing for the lithium industry for today. Include:
1. Executive summary (2-3 paragraphs)
2. Key highlights (top 5-7 items)
3. Price summary (current prices, trends, changes)
4. News summary (top 5 news items with sentiment)
5. Top arbitrage opportunities (if any)

Return as JSON with these exact keys: summary, key_highlights (array), price_summary (object), news_summary (array), arbitrage_opportunities (array).`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from Perplexity API");
    }

    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    const briefing = JSON.parse(jsonContent);

    return briefing;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to generate daily briefing"
    );
    throw error;
  }
}

/**
 * Store price data in database
 */
export async function storePriceData(priceData: PerplexityPriceData[]): Promise<void> {
  try {
    const records = priceData.map((price) => ({
      product_type: price.product_type,
      purity_level: price.purity_level,
      price_per_unit: price.price,
      currency: price.currency,
      unit: "ton",
      source: price.source,
      location_country: price.location?.country || null,
      location_city: price.location?.city || null,
      timestamp: price.timestamp || new Date(),
    }));

    const { error } = await supabaseAdmin.from("price_data").insert(records);

    if (error) {
      throw new Error(`Failed to store price data: ${error.message}`);
    }

    logger.info({ count: records.length }, "Stored price data in database");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to store price data"
    );
    throw error;
  }
}

/**
 * Store arbitrage opportunities in database
 */
export async function storeArbitrageOpportunities(
  opportunities: ArbitrageOpportunity[]
): Promise<void> {
  try {
    const records = opportunities.map((opp) => ({
      product_type: opp.product_type,
      purity_level: opp.purity_level,
      buy_location_country: opp.buy_location.country,
      buy_location_city: opp.buy_location.city || null,
      buy_price: opp.buy_price,
      buy_currency: "USD",
      sell_location_country: opp.sell_location.country,
      sell_location_city: opp.sell_location.city || null,
      sell_price: opp.sell_price,
      sell_currency: "USD",
      quantity_available: opp.quantity_available || null,
      estimated_profit: opp.estimated_profit,
      profit_margin_percentage: opp.profit_margin,
      estimated_logistics_cost: opp.logistics_cost || null,
      net_profit: opp.estimated_profit - (opp.logistics_cost || 0),
      confidence_score: 75, // Default confidence
      status: "active",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }));

    const { error } = await supabaseAdmin.from("arbitrage_opportunities").insert(records);

    if (error) {
      throw new Error(`Failed to store arbitrage opportunities: ${error.message}`);
    }

    logger.info({ count: records.length }, "Stored arbitrage opportunities in database");
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to store arbitrage opportunities"
    );
    throw error;
  }
}


