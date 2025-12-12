import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, Upload } from "lucide-react";

/**
 * KYC Verification Page
 * PRD: KYC flow <10 min, verification turnaround <24h
 */
export default function KYC() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company_name: "",
    company_registration_number: "",
    company_address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
    },
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    verification_documents: [] as Array<{ type: string; url: string; name: string }>,
  });

  // Get current user ID (this would come from auth context)
  const userId = "current-user-id"; // TODO: Get from auth context

  // Fetch KYC status
  const { data: kycStatus, isLoading } = useQuery({
    queryKey: ["kyc", userId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/users/${userId}/kyc`);
      if (!response.ok) throw new Error("Failed to fetch KYC status");
      const result = await response.json();
      return result.data;
    },
  });

  // Submit KYC application
  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/v1/users/${userId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit KYC application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", userId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: Upload files to S3/storage and get URLs
    // For now, just add placeholder
    const newDocs = Array.from(files).map((file) => ({
      type: "other",
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData({
      ...formData,
      verification_documents: [...formData.verification_documents, ...newDocs],
    });
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const status = kycStatus?.kyc_status || "not_submitted";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Complete your Know Your Customer verification to access platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Display */}
          {status !== "not_submitted" && (
            <Alert className="mb-6">
              <div className="flex items-center gap-2">
                {status === "approved" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {status === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                {status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                <AlertDescription>
                  <strong>Status:</strong> {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === "pending" && " - Review typically takes less than 24 hours"}
                  {status === "rejected" && kycStatus?.review_notes && (
                    <div className="mt-2">
                      <strong>Notes:</strong> {kycStatus.review_notes}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* KYC Form */}
          {status === "not_submitted" || status === "rejected" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_registration_number">Registration Number</Label>
                  <Input
                    id="company_registration_number"
                    value={formData.company_registration_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_registration_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Company Address *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    placeholder="Street"
                    value={formData.company_address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_address: {
                          ...formData.company_address,
                          street: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="City"
                    value={formData.company_address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_address: {
                          ...formData.company_address,
                          city: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="State"
                    value={formData.company_address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_address: {
                          ...formData.company_address,
                          state: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="Country *"
                    value={formData.company_address.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_address: {
                          ...formData.company_address,
                          country: e.target.value,
                        },
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Postal Code"
                    value={formData.company_address.postal_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_address: {
                          ...formData.company_address,
                          postal_code: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_person: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="documents">Verification Documents</Label>
                <div className="mt-2">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload COA, certifications, test reports, or other verification documents
                  </p>
                </div>
                {formData.verification_documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.verification_documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Upload className="h-4 w-4" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {submitMutation.error instanceof Error
                      ? submitMutation.error.message
                      : "Failed to submit application"}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit KYC Application"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <strong>Company:</strong> {kycStatus?.company_name}
              </div>
              <div>
                <strong>Contact:</strong> {kycStatus?.contact_email}
              </div>
              {kycStatus?.submitted_at && (
                <div>
                  <strong>Submitted:</strong>{" "}
                  {new Date(kycStatus.submitted_at).toLocaleDateString()}
                </div>
              )}
              {kycStatus?.reviewed_at && (
                <div>
                  <strong>Reviewed:</strong>{" "}
                  {new Date(kycStatus.reviewed_at).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

