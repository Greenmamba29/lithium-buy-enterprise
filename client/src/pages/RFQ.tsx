import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RFQForm } from "@/components/RFQForm";
import { Loader2, FileText, Plus } from "lucide-react";
import { useState } from "react";

export default function RFQ() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();
  const page = 1;
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["rfqs", page],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/rfq?page=${page}&limit=${limit}`);
      return res.json();
    },
  });

  const rfqs = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit, total: 0, totalPages: 1 };

  const createRFQMutation = useMutation({
    mutationFn: async (rfqData: any) => {
      const res = await apiRequest("POST", "/api/rfq", rfqData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      setShowCreateForm(false);
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Request for Quote (RFQ)
            </h1>
            <p className="text-muted-foreground">
              Create and manage RFQs to source lithium products from verified suppliers
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create RFQ
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New RFQ</CardTitle>
              <CardDescription>Fill in the details to create a new request for quote</CardDescription>
            </CardHeader>
            <CardContent>
              <RFQForm
                onSubmit={(data) => createRFQMutation.mutate(data)}
                onCancel={() => setShowCreateForm(false)}
                isLoading={createRFQMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">Failed to load RFQs. Please try again.</p>
            </CardContent>
          </Card>
        ) : rfqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No RFQs found. Create your first RFQ to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfqs.map((rfq: any) => (
              <Card key={rfq.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <Badge
                      variant={
                        rfq.status === "published"
                          ? "default"
                          : rfq.status === "awarded"
                          ? "default"
                          : "outline"
                      }
                    >
                      {rfq.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {rfq.product_type} • {rfq.purity_level}% purity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-semibold">
                      {rfq.quantity} {rfq.unit || "tons"}
                    </span>
                  </div>
                  {rfq.target_price && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target Price</span>
                      <span className="font-semibold">
                        {rfq.currency} {rfq.target_price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline</span>
                    <span>{new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                  {rfq.rfq_responses && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Responses</span>
                      <span>{rfq.rfq_responses[0]?.count || 0}</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => (window.location.href = `/rfq/${rfq.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
