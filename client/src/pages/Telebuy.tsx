import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Video, FileSignature, Shield, Zap } from 'lucide-react';
import TelebuyFlow from '@/components/TelebuyFlow';
import { suppliers, getSupplierById } from '@/data/suppliers';

export default function Telebuy() {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [started, setStarted] = useState(false);

  const selectedSupplier = selectedSupplierId ? getSupplierById(selectedSupplierId) : null;

  const features = [
    {
      icon: Video,
      title: 'Live Video Negotiation',
      description: 'Connect face-to-face with suppliers via secure video calls',
    },
    {
      icon: FileSignature,
      title: 'Integrated DocuSign',
      description: 'Sign contracts and agreements digitally during your call',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Protected payments with transparent commission structure',
    },
    {
      icon: Zap,
      title: 'Fast Turnaround',
      description: 'Complete deals in hours instead of weeks',
    },
  ];

  if (started && selectedSupplier) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-telebuy-flow">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setStarted(false)}
            data-testid="button-back-telebuy"
          >
            Back to Telebuy Setup
          </Button>
          <TelebuyFlow supplier={selectedSupplier} quantity={quantity} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-telebuy">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Telebuy</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Complete lithium transactions end-to-end with video calls, 
            document signing, and secure payments
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">How Telebuy Works</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={feature.title}>
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Commission Structure</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our transparent fee structure ensures you know exactly what you're paying:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 rounded bg-muted/30">
                    <span>Transactions under $500K</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded bg-muted/30">
                    <span>$500K - $2M</span>
                    <span className="font-semibold">4%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded bg-muted/30">
                    <span>Over $2M</span>
                    <span className="font-semibold">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Start a Telebuy Session</CardTitle>
                <CardDescription>
                  Select a supplier and quantity to begin your transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Supplier</Label>
                  <Select value={selectedSupplierId || ''} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger data-testid="select-supplier">
                      <SelectValue placeholder="Choose a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSupplier && (
                  <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price per MT</span>
                      <span className="font-semibold">
                        ${selectedSupplier.pricePerUnit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purity</span>
                      <span>{selectedSupplier.purityLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Order</span>
                      <span>{selectedSupplier.minOrderQuantity} MT</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (MT)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={selectedSupplier?.minOrderQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    data-testid="input-quantity"
                  />
                </div>

                {selectedSupplier && (
                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex justify-between mb-2">
                      <span>Estimated Total</span>
                      <span className="font-bold text-lg">
                        ${(selectedSupplier.pricePerUnit * quantity).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      + 3-5% service fee
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-cta text-cta-foreground"
                  disabled={!selectedSupplier}
                  onClick={() => setStarted(true)}
                  data-testid="button-start-telebuy"
                >
                  Start Telebuy Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
