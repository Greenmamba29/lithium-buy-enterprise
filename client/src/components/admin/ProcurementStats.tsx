import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProcurementStatsProps {
  data: {
    totalRFQs: number;
    publishedRFQs: number;
    awardedRFQs: number;
    totalResponses: number;
    averageResponseTime: number;
    totalContractValue: number;
  };
}

export function ProcurementStats({ data }: ProcurementStatsProps) {
  const responseRate =
    data.totalRFQs > 0 ? ((data.totalResponses / data.totalRFQs) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement Statistics</CardTitle>
        <CardDescription>RFQ and contract management metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total RFQs</p>
            <p className="text-2xl font-bold">{data.totalRFQs}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-blue-500">{data.publishedRFQs}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Awarded</p>
            <p className="text-2xl font-bold text-green-500">{data.awardedRFQs}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Responses</p>
            <p className="text-2xl font-bold">{data.totalResponses}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-2xl font-bold">{responseRate}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contract Value</p>
            <p className="text-2xl font-bold">${data.totalContractValue.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
