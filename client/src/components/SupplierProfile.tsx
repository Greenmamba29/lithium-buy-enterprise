import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MapPin,
  Clock,
  Building2,
  Award,
  FileText,
  Video,
  Shield,
  Package,
  TrendingUp,
  CheckCircle,
  ThumbsUp,
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import StarRating from './StarRating';
import type { Supplier, Review } from '@/data/suppliers';
import { getReviewsBySupplier } from '@/data/suppliers';

// todo: remove mock functionality
import testimonial1 from '@assets/generated_images/male_executive_testimonial_avatar.png';
import testimonial2 from '@assets/generated_images/female_executive_testimonial_avatar.png';
import testimonial3 from '@assets/generated_images/male_professional_testimonial_avatar.png';

interface SupplierProfileProps {
  supplier: Supplier;
}

const avatars = [testimonial1, testimonial2, testimonial3];

// todo: remove mock functionality
const pricingTiers = [
  { quantity: '1-5 MT', price: 100, discount: 0 },
  { quantity: '5-20 MT', price: 97, discount: 3 },
  { quantity: '20-50 MT', price: 93, discount: 7 },
  { quantity: '50+ MT', price: 88, discount: 12 },
];

export default function SupplierProfile({ supplier }: SupplierProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const reviews = getReviewsBySupplier(supplier.id);

  return (
    <div className="space-y-6" data-testid="supplier-profile">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-primary">
                  {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                    {supplier.name}
                  </h1>
                  <VerificationBadge tier={supplier.verificationTier} size="md" showLabel />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {supplier.location}, {supplier.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {supplier.yearsInBusiness} years in business
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-success" />
                    {supplier.responseTime} response
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} />
                  <Separator orientation="vertical" className="h-5" />
                  <span className="text-sm">
                    <strong>{supplier.transactionCount.toLocaleString()}</strong> transactions
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button
                size="lg"
                className="bg-cta text-cta-foreground border-cta"
                data-testid="button-profile-quote"
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Quote
              </Button>
              <Button variant="outline" size="lg" data-testid="button-profile-telebuy">
                <Video className="h-4 w-4 mr-2" />
                Schedule Telebuy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Products & Pricing</TabsTrigger>
          <TabsTrigger value="certifications" data-testid="tab-certifications">Certifications</TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{supplier.yearsInBusiness}</p>
                <p className="text-sm text-muted-foreground">Years in Business</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{supplier.transactionCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-professional-blue mx-auto mb-2" />
                <p className="text-2xl font-bold">{supplier.responseTime}</p>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold">{supplier.certifications.length}</p>
                <p className="text-sm text-muted-foreground">Certifications</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                About This Supplier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{supplier.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Specialties:</span>
                {supplier.specialties.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Price/MT</TableHead>
                    <TableHead>MOQ</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium capitalize">
                      {supplier.productType} Lithium
                    </TableCell>
                    <TableCell>{supplier.purityLevel}%</TableCell>
                    <TableCell>${supplier.pricePerUnit.toLocaleString()}</TableCell>
                    <TableCell>{supplier.minOrderQuantity} MT</TableCell>
                    <TableCell>
                      <Badge
                        variant={supplier.availability === 'in-stock' ? 'default' : 'secondary'}
                        className={supplier.availability === 'in-stock' ? 'bg-success/10 text-success' : ''}
                      >
                        {supplier.availability.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {supplier.hasBulkDiscount && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Pricing Tiers
                  <Badge className="bg-gold/15 text-gold border-gold/30">Bulk Discount</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.quantity}
                      className={`p-4 rounded-lg border text-center ${
                        tier.discount > 0 ? 'border-success/30 bg-success/5' : ''
                      }`}
                    >
                      <p className="text-sm text-muted-foreground mb-1">{tier.quantity}</p>
                      <p className="text-xl font-bold">{tier.price}%</p>
                      {tier.discount > 0 && (
                        <Badge className="mt-2 bg-success/10 text-success border-success/20">
                          Save {tier.discount}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Request Custom Quote
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {supplier.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{cert}</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review.id} className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <img
                        src={avatars[index % avatars.length]}
                        alt={review.author}
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{review.author}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.company}</p>
                        <StarRating rating={review.rating} showCount={false} size="sm" />
                        <p className="mt-3 text-sm">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>{new Date(review.date).toLocaleDateString()}</span>
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No reviews yet for this supplier.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
