import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BidForm } from "@/components/BidForm";
import { AuctionTimer } from "@/components/AuctionTimer";
import { Loader2, Gavel, MapPin, Package } from "lucide-react";
import { useState } from "react";

export default function AuctionDetail() {
  const [, params] = useRoute("/auctions/:id");
  const auctionId = params?.id;
  const queryClient = useQueryClient();
  const [showBidForm, setShowBidForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/auctions/${auctionId}`);
      return res.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
    enabled: !!auctionId,
  });

  const auction = data?.data;

  const placeBidMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", `/api/auctions/${auctionId}/bid`, {
        amount,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      setShowBidForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Failed to load auction. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLive = auction.status === "live";
  const canBid = isLive && new Date(auction.end_time) > new Date();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">{auction.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{auction.auction_type}</Badge>
            <Badge className={auction.status === "live" ? "bg-green-500" : "bg-gray-500"}>
              {auction.status.toUpperCase()}
            </Badge>
          </div>
          {auction.description && (
            <p className="text-muted-foreground mb-4">{auction.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Auction Lots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auction.auction_lots?.map((lot: any, index: number) => (
                    <div key={lot.id || index} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">Lot #{lot.lot_number}: {lot.title}</h3>
                          {lot.description && (
                            <p className="text-sm text-muted-foreground mt-1">{lot.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Quantity: {lot.quantity} {lot.unit || "tons"}</span>
                            {lot.product_type && (
                              <Badge variant="outline">{lot.product_type}</Badge>
                            )}
                            {lot.purity_level && (
                              <Badge variant="outline">{lot.purity_level}% purity</Badge>
                            )}
                            {lot.location_country && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{lot.location_country}</span>
                                {lot.location_city && <span>, {lot.location_city}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Bid History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auction.bids && auction.bids.length > 0 ? (
                  <div className="space-y-2">
                    {auction.bids
                      .filter((bid: any) => !bid.is_retracted)
                      .sort((a: any, b: any) => b.amount - a.amount)
                      .map((bid: any) => (
                        <div
                          key={bid.id}
                          className={`flex items-center justify-between p-3 rounded ${
                            bid.is_winning ? "bg-green-50 dark:bg-green-950" : "bg-stone-50 dark:bg-stone-900"
                          }`}
                        >
                          <div>
                            <span className="font-semibold">
                              {bid.bidder?.company_name || "Anonymous Bidder"}
                            </span>
                            {bid.is_winning && (
                              <Badge className="ml-2 bg-green-500">Winning</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {bid.currency} {bid.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(bid.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No bids yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bid */}
            <Card>
              <CardHeader>
                <CardTitle>Current Bid</CardTitle>
                <CardDescription>
                  <AuctionTimer
                    endTime={auction.end_time}
                    startTime={auction.start_time}
                    status={auction.status}
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {auction.currency} {auction.current_bid?.toLocaleString() || auction.starting_price.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Starting Price: {auction.currency} {auction.starting_price.toLocaleString()}
                  </p>
                  {auction.reserve_price && (
                    <p className="text-sm text-muted-foreground">
                      Reserve: {auction.currency} {auction.reserve_price.toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Bid Increment: {auction.currency} {auction.bid_increment}
                  </p>
                </div>

                {canBid && (
                  <>
                    {!showBidForm ? (
                      <Button
                        className="w-full"
                        onClick={() => setShowBidForm(true)}
                      >
                        Place Bid
                      </Button>
                    ) : (
                      <BidForm
                        auction={auction}
                        onSubmit={(amount) => placeBidMutation.mutate(amount)}
                        onCancel={() => setShowBidForm(false)}
                        isLoading={placeBidMutation.isPending}
                      />
                    )}
                  </>
                )}

                {!canBid && (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {auction.status === "ended" ? "Auction Ended" : "Auction Not Live"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


