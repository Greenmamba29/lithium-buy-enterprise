import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuctionTimer } from "./AuctionTimer";
import { Gavel, Clock, MapPin } from "lucide-react";

interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    auction_type: string;
    status: string;
    start_time: string;
    end_time: string;
    current_bid: number;
    starting_price: number;
    currency: string;
    auction_lots?: Array<{
      title: string;
      quantity: number;
      unit: string;
      location_country?: string;
    }>;
  };
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const auctionTypeLabels: Record<string, string> = {
    english: "English",
    dutch: "Dutch",
    sealed_bid: "Sealed Bid",
    reverse: "Reverse",
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500",
    live: "bg-green-500",
    ended: "bg-gray-500",
  };

  const totalQuantity = auction.auction_lots?.reduce(
    (sum, lot) => sum + lot.quantity,
    0
  ) || 0;
  const primaryLocation = auction.auction_lots?.[0]?.location_country;

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{auction.title}</CardTitle>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{auctionTypeLabels[auction.auction_type] || auction.auction_type}</Badge>
                <Badge className={statusColors[auction.status] || "bg-gray-500"}>
                  {auction.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <CardDescription>
            {totalQuantity > 0 && (
              <div className="flex items-center gap-1 text-sm mt-2">
                <span>{totalQuantity} {auction.auction_lots?.[0]?.unit || "tons"}</span>
                {primaryLocation && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{primaryLocation}</span>
                  </>
                )}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Bid</span>
              <span className="text-2xl font-bold">
                {auction.currency} {auction.current_bid?.toLocaleString() || auction.starting_price.toLocaleString()}
              </span>
            </div>

            <AuctionTimer endTime={auction.end_time} status={auction.status} />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gavel className="h-4 w-4" />
              <span>{auction.auction_lots?.length || 0} lot{auction.auction_lots?.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


