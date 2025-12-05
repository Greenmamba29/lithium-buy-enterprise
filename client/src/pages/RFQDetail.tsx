import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteComparison } from "@/components/QuoteComparison";
import { Loader2, FileText, Award, Send } from "lucide-react";
import { useState } from "react";

export default function RFQDetail() {
  const [, params] = useRoute("/rfq/:id");
  const rfqId = params?.id;
  const queryClient = useQueryClient();
  const [showResponseForm, setShowResponseForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/rfq/${rfqId}`);
      return res.json();
    },
    enabled: !!rfqId,
  });

  const rfq = data?.data;
  const responses = rfq?.rfq_responses || [];

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/rfq/${rfqId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq", rfqId] });
    },
  });

  const awardMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const res = await apiRequest("POST", `/api/rfq/${rfqId}/award`, {
        response_id: responseId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfq", rfqId] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Failed to load RFQ. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBuyer = true; // Would check user role
  const canPublish = rfq.status === "draft" && isBuyer;
  const canAward = rfq.status === "published" && responses.length > 0 && isBuyer;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">{rfq.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{rfq.product_type}</Badge>
            <Badge
              className={
                rfq.status === "published"
                  ? "bg-green-500"
                  : rfq.status === "awarded"
                  ? "bg-blue-500"
                  : "bg-gray-500"
              }
            >
              {rfq.status.toUpperCase()}
            </Badge>
          </div>
          {rfq.description && (
            <p className="text-muted-foreground mb-4">{rfq.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Details */}
            <Card>
              <CardHeader>
                <CardTitle>RFQ Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Product Type</p>
                    <p className="font-semibold capitalize">{rfq.product_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purity Level</p>
                    <p className="font-semibold">{rfq.purity_level}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold">
                      {rfq.quantity} {rfq.unit || "tons"}
                    </p>
                  </div>
                  {rfq.target_price && (
                    <div>
                      <p className="text-sm text-muted-foreground">Target Price</p>
                      <p className="font-semibold">
                        {rfq.currency} {rfq.target_price.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Location</p>
                    <p className="font-semibold">
                      {rfq.delivery_location_city
                        ? `${rfq.delivery_location_city}, `
                        : ""}
                      {rfq.delivery_location_country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responses */}
            {responses.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Responses ({responses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuoteComparison
                    rfq={rfq}
                    responses={responses}
                    onAward={(responseId) => awardMutation.mutate(responseId)}
                    canAward={canAward}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No responses yet. {rfq.status === "published" && "Waiting for supplier quotes..."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canPublish && (
                  <Button
                    className="w-full"
                    onClick={() => publishMutation.mutate()}
                    disabled={publishMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Publish RFQ
                  </Button>
                )}

                {rfq.status === "published" && !isBuyer && (
                  <Button
                    className="w-full"
                    onClick={() => setShowResponseForm(true)}
                  >
                    Submit Quote
                  </Button>
                )}

                {rfq.status === "awarded" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Navigate to contract creation
                      window.location.href = `/rfq/${rfqId}/contract`;
                    }}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Create Contract
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
