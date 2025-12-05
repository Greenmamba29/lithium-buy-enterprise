import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BidFormProps {
  auction: {
    current_bid: number;
    starting_price: number;
    bid_increment: number;
    currency: string;
  };
  onSubmit: (amount: number) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BidForm({ auction, onSubmit, onCancel, isLoading }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<number>(
    auction.current_bid ? auction.current_bid + auction.bid_increment : auction.starting_price + auction.bid_increment
  );

  const minBid = auction.current_bid
    ? auction.current_bid + auction.bid_increment
    : auction.starting_price + auction.bid_increment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount >= minBid) {
      onSubmit(bidAmount);
    }
  };

  const quickBid = (increment: number) => {
    setBidAmount(minBid + increment * auction.bid_increment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bid</CardTitle>
        <CardDescription>
          Minimum bid: {auction.currency} {minBid.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bid-amount">Bid Amount</Label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{auction.currency}</span>
              <Input
                id="bid-amount"
                type="number"
                min={minBid}
                step={auction.bid_increment}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseFloat(e.target.value) || minBid)}
                className="flex-1"
                required
              />
            </div>
            {bidAmount < minBid && (
              <p className="text-sm text-destructive mt-1">
                Bid must be at least {auction.currency} {minBid.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickBid(0)}
            >
              Min
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickBid(1)}
            >
              +{auction.bid_increment}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickBid(5)}
            >
              +{auction.bid_increment * 5}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => quickBid(10)}
            >
              +{auction.bid_increment * 10}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={bidAmount < minBid || isLoading}
            >
              {isLoading ? "Placing Bid..." : "Submit Bid"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


