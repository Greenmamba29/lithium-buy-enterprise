import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuctionCard } from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Gavel } from "lucide-react";
import { useState } from "react";

export default function Auctions() {
  const [page, setPage] = useState(1);
  const [auctionType, setAuctionType] = useState<string>("all");
  const [productType, setProductType] = useState<string>("all");
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["auctions", page, auctionType, productType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (auctionType !== "all") params.append("auction_type", auctionType);
      if (productType !== "all") params.append("product_type", productType);

      const res = await apiRequest("GET", `/api/auctions?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  const auctions = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 1 };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-2">
              <Gavel className="h-8 w-8" />
              Live Auctions
            </h1>
            <p className="text-muted-foreground">
              Bid on verified lithium lots from miners, refiners, and brokers
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter auctions by type and product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={auctionType} onValueChange={setAuctionType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Auction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="english">English Auction</SelectItem>
                  <SelectItem value="dutch">Dutch Auction</SelectItem>
                  <SelectItem value="sealed_bid">Sealed Bid</SelectItem>
                  <SelectItem value="reverse">Reverse Auction</SelectItem>
                </SelectContent>
              </Select>

              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Product Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="raw">Raw Lithium</SelectItem>
                  <SelectItem value="compound">Lithium Compounds</SelectItem>
                  <SelectItem value="processed">Processed Lithium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Auctions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">Failed to load auctions. Please try again.</p>
            </CardContent>
          </Card>
        ) : auctions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active auctions found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction: any) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


