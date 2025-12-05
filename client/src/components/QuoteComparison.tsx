import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, CheckCircle2 } from "lucide-react";

interface QuoteComparisonProps {
  rfq: any;
  responses: any[];
  onAward: (responseId: string) => void;
  canAward?: boolean;
}

export function QuoteComparison({
  rfq,
  responses,
  onAward,
  canAward = false,
}: QuoteComparisonProps) {
  // Sort responses by score (highest first)
  const sortedResponses = [...responses].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Delivery Time</TableHead>
            <TableHead>Payment Terms</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            {canAward && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResponses.map((response) => (
            <TableRow key={response.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {response.supplier?.logo_url && (
                    <img
                      src={response.supplier.logo_url}
                      alt={response.supplier.name}
                      className="h-8 w-8 rounded"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{response.supplier?.name || "Unknown"}</p>
                    <Badge variant="outline" className="text-xs">
                      {response.supplier?.verification_tier || "bronze"}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold">
                  {response.currency} {response.quote_price.toLocaleString()}
                </span>
                {rfq.target_price && (
                  <p className="text-xs text-muted-foreground">
                    {response.quote_price <= rfq.target_price ? (
                      <span className="text-green-600">Below target</span>
                    ) : (
                      <span className="text-orange-600">
                        +{(((response.quote_price - rfq.target_price) / rfq.target_price) * 100).toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {response.delivery_time_days ? (
                  <span>{response.delivery_time_days} days</span>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                {response.payment_terms || (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{response.score?.toFixed(0) || "N/A"}</span>
                  {response.score && response.score >= 80 && (
                    <Badge variant="default" className="bg-green-500">
                      Best
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    response.status === "accepted"
                      ? "default"
                      : response.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {response.status}
                </Badge>
              </TableCell>
              {canAward && response.status === "submitted" && (
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onAward(response.id)}
                    variant="outline"
                  >
                    <Award className="mr-2 h-3 w-3" />
                    Award
                  </Button>
                </TableCell>
              )}
              {response.status === "accepted" && (
                <TableCell>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {responses.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>
            Responses are sorted by score (0-100), which considers price, delivery time, and payment
            terms.
          </p>
        </div>
      )}
    </div>
  );
}
