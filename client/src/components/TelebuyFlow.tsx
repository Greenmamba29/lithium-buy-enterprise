import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Video,
  Calendar,
  Clock,
  FileSignature,
  CreditCard,
  Check,
  ChevronRight,
  Shield,
  Lock,
} from 'lucide-react';
import type { Supplier } from '@/data/suppliers';

interface TelebuyFlowProps {
  supplier: Supplier;
  quantity?: number;
}

type Step = 'schedule' | 'sign' | 'payment' | 'confirm';

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '2:00 PM', '3:00 PM', '4:00 PM',
];

const durations = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
];

export default function TelebuyFlow({ supplier, quantity = 10 }: TelebuyFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('schedule');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [paymentMethod, setPaymentMethod] = useState('wire');

  const subtotal = supplier.pricePerUnit * quantity;
  const commission = subtotal * 0.04;
  const total = subtotal + commission;

  const steps: { key: Step; label: string; icon: typeof Video }[] = [
    { key: 'schedule', label: 'Schedule Call', icon: Video },
    { key: 'sign', label: 'Sign Documents', icon: FileSignature },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'confirm', label: 'Confirm', icon: Check },
  ];

  const stepIndex = steps.findIndex(s => s.key === currentStep);

  const nextStep = () => {
    const idx = steps.findIndex(s => s.key === currentStep);
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1].key);
    }
  };

  const prevStep = () => {
    const idx = steps.findIndex(s => s.key === currentStep);
    if (idx > 0) {
      setCurrentStep(steps[idx - 1].key);
    }
  };

  // todo: remove mock functionality
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates.slice(0, 10);
  };

  const availableDates = generateDates();

  return (
    <div className="space-y-6" data-testid="telebuy-flow">
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                idx <= stepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {currentStep === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Schedule Video Call with {supplier.name}
            </CardTitle>
            <CardDescription>
              Select a convenient time for your Telebuy session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Select Date</Label>
              <div className="grid grid-cols-5 gap-2">
                {availableDates.map((date) => {
                  const d = new Date(date);
                  return (
                    <Button
                      key={date}
                      variant={selectedDate === date ? 'default' : 'outline'}
                      className="flex flex-col h-auto py-2"
                      onClick={() => setSelectedDate(date)}
                      data-testid={`button-date-${date}`}
                    >
                      <span className="text-xs">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-lg font-bold">{d.getDate()}</span>
                      <span className="text-xs">
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-3 block">Select Time</Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      data-testid={`button-time-${time}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Duration</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>Zoom video call</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-cta text-cta-foreground"
              disabled={!selectedDate || !selectedTime}
              onClick={nextStep}
              data-testid="button-continue-schedule"
            >
              Continue to Document Signing
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'sign' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Sign Purchase Agreement
            </CardTitle>
            <CardDescription>
              Review and sign the supplier agreement via DocuSign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="h-16 w-12 bg-primary/10 rounded flex items-center justify-center">
                  <FileSignature className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Lithium Supply Agreement</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Purchase agreement for {quantity} MT of {supplier.productType} lithium
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="outline">Requires Signature</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <Shield className="h-5 w-5 text-success" />
              <div className="text-sm">
                <p className="font-medium text-success">Secure Document Signing</p>
                <p className="text-muted-foreground">
                  Documents are signed securely via DocuSign with legal validity
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={nextStep}
              data-testid="button-docusign"
            >
              <FileSignature className="mr-2 h-4 w-4" />
              Initiate DocuSign
            </Button>

            <Button variant="outline" className="w-full" onClick={prevStep}>
              Back to Scheduling
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Select your preferred payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                {[
                  { value: 'wire', label: 'Wire Transfer', desc: 'Bank to bank transfer' },
                  { value: 'escrow', label: 'Escrow Service', desc: 'Protected payment' },
                  { value: 'lc', label: 'Letter of Credit', desc: 'Bank guaranteed payment' },
                ].map((method) => (
                  <div
                    key={method.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${
                      paymentMethod === method.value ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <RadioGroupItem value={method.value} id={method.value} />
                    <div>
                      <Label htmlFor={method.value} className="cursor-pointer">
                        {method.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{method.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({quantity} MT @ ${supplier.pricePerUnit.toLocaleString()}/MT)</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Fee (4%)</span>
                <span>${commission.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Our service fee: 3-5% of transaction value
              </p>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              className="w-full bg-cta text-cta-foreground"
              onClick={nextStep}
              data-testid="button-continue-payment"
            >
              Continue to Confirmation
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full" onClick={prevStep}>
              Back to Document Signing
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'confirm' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>
              Review your order details before confirming
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Call Scheduled</span>
                </div>
                <span className="font-medium">
                  {selectedDate && new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="font-medium">{selectedDuration} minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-muted/30">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Payment Method</span>
                </div>
                <span className="font-medium capitalize">{paymentMethod.replace('-', ' ')}</span>
              </div>
            </div>

            <Separator />

            <div className="p-4 rounded-lg border">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{supplier.name}</span>
                <Badge>{supplier.purityLevel}% Purity</Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {supplier.productType} Lithium - {quantity} MT
              </p>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Lock className="h-5 w-5 text-primary" />
              <p className="text-sm">
                Your payment is protected. Funds are held securely until delivery confirmation.
              </p>
            </div>

            <Button
              className="w-full bg-cta text-cta-foreground"
              data-testid="button-confirm-order"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm Order
            </Button>

            <Button variant="outline" className="w-full" onClick={prevStep}>
              Back to Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
