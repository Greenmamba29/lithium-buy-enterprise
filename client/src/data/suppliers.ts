// todo: remove mock functionality - this should come from API
export type VerificationTier = 'gold' | 'silver' | 'bronze';
export type ProductType = 'raw' | 'compound' | 'processed';
export type PurityLevel = '99' | '99.5' | '99.9';

export interface Supplier {
  id: string;
  name: string;
  logo?: string;
  verificationTier: VerificationTier;
  rating: number;
  reviewCount: number;
  transactionCount: number;
  pricePerUnit: number;
  currency: string;
  unit: string;
  location: string;
  country: string;
  productType: ProductType;
  purityLevel: PurityLevel;
  responseTime: string;
  yearsInBusiness: number;
  hasBulkDiscount: boolean;
  minOrderQuantity: number;
  availability: 'in-stock' | 'limited' | 'contact';
  certifications: string[];
  description: string;
  specialties: string[];
}

export interface Review {
  id: string;
  supplierId: string;
  author: string;
  company: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  helpful: number;
}

// todo: remove mock functionality
export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Albemarle Lithium Corp',
    verificationTier: 'gold',
    rating: 4.9,
    reviewCount: 342,
    transactionCount: 1205,
    pricePerUnit: 78500,
    currency: 'USD',
    unit: 'MT',
    location: 'Charlotte, NC',
    country: 'USA',
    productType: 'compound',
    purityLevel: '99.9',
    responseTime: '< 2 hours',
    yearsInBusiness: 28,
    hasBulkDiscount: true,
    minOrderQuantity: 5,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001', 'IATF 16949'],
    description: 'Global leader in lithium compounds for battery applications.',
    specialties: ['Battery Grade LiOH', 'Lithium Carbonate']
  },
  {
    id: '2',
    name: 'SQM Mining Solutions',
    verificationTier: 'gold',
    rating: 4.8,
    reviewCount: 289,
    transactionCount: 987,
    pricePerUnit: 72000,
    currency: 'USD',
    unit: 'MT',
    location: 'Santiago',
    country: 'Chile',
    productType: 'raw',
    purityLevel: '99.5',
    responseTime: '< 4 hours',
    yearsInBusiness: 35,
    hasBulkDiscount: true,
    minOrderQuantity: 10,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001'],
    description: 'Premium raw lithium from the Atacama Desert.',
    specialties: ['Raw Lithium', 'Brine Extraction']
  },
  {
    id: '3',
    name: 'Ganfeng Lithium Co.',
    verificationTier: 'gold',
    rating: 4.7,
    reviewCount: 456,
    transactionCount: 1543,
    pricePerUnit: 69500,
    currency: 'USD',
    unit: 'MT',
    location: 'Jiangxi',
    country: 'China',
    productType: 'processed',
    purityLevel: '99.9',
    responseTime: '< 1 hour',
    yearsInBusiness: 22,
    hasBulkDiscount: true,
    minOrderQuantity: 2,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'IATF 16949', 'GB/T 23331'],
    description: 'Integrated lithium producer for EV battery supply chain.',
    specialties: ['Battery Cells', 'Lithium Metal']
  },
  {
    id: '4',
    name: 'Livent Corporation',
    verificationTier: 'silver',
    rating: 4.6,
    reviewCount: 198,
    transactionCount: 654,
    pricePerUnit: 76200,
    currency: 'USD',
    unit: 'MT',
    location: 'Philadelphia, PA',
    country: 'USA',
    productType: 'compound',
    purityLevel: '99.9',
    responseTime: '< 6 hours',
    yearsInBusiness: 18,
    hasBulkDiscount: true,
    minOrderQuantity: 3,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001'],
    description: 'Specialty lithium compounds for high-performance applications.',
    specialties: ['Butyllithium', 'Lithium Hydroxide']
  },
  {
    id: '5',
    name: 'Pilbara Minerals',
    verificationTier: 'silver',
    rating: 4.5,
    reviewCount: 167,
    transactionCount: 423,
    pricePerUnit: 68000,
    currency: 'USD',
    unit: 'MT',
    location: 'Perth',
    country: 'Australia',
    productType: 'raw',
    purityLevel: '99',
    responseTime: '< 8 hours',
    yearsInBusiness: 12,
    hasBulkDiscount: true,
    minOrderQuantity: 20,
    availability: 'limited',
    certifications: ['ISO 9001', 'ISO 45001'],
    description: 'Hard rock spodumene concentrate producer.',
    specialties: ['Spodumene', 'Technical Grade']
  },
  {
    id: '6',
    name: 'Tianqi Lithium',
    verificationTier: 'gold',
    rating: 4.8,
    reviewCount: 312,
    transactionCount: 1089,
    pricePerUnit: 71500,
    currency: 'USD',
    unit: 'MT',
    location: 'Chengdu',
    country: 'China',
    productType: 'processed',
    purityLevel: '99.9',
    responseTime: '< 2 hours',
    yearsInBusiness: 25,
    hasBulkDiscount: true,
    minOrderQuantity: 5,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
    description: 'Vertically integrated lithium producer with global operations.',
    specialties: ['Battery Grade Materials', 'Technical Services']
  },
  {
    id: '7',
    name: 'Sigma Lithium',
    verificationTier: 'bronze',
    rating: 4.3,
    reviewCount: 89,
    transactionCount: 234,
    pricePerUnit: 65000,
    currency: 'USD',
    unit: 'MT',
    location: 'Minas Gerais',
    country: 'Brazil',
    productType: 'raw',
    purityLevel: '99',
    responseTime: '< 12 hours',
    yearsInBusiness: 8,
    hasBulkDiscount: false,
    minOrderQuantity: 25,
    availability: 'limited',
    certifications: ['ISO 9001'],
    description: 'Green lithium producer focused on sustainability.',
    specialties: ['Green Lithium', 'ESG Certified']
  },
  {
    id: '8',
    name: 'Allkem Limited',
    verificationTier: 'silver',
    rating: 4.4,
    reviewCount: 145,
    transactionCount: 387,
    pricePerUnit: 70500,
    currency: 'USD',
    unit: 'MT',
    location: 'Buenos Aires',
    country: 'Argentina',
    productType: 'compound',
    purityLevel: '99.5',
    responseTime: '< 6 hours',
    yearsInBusiness: 15,
    hasBulkDiscount: true,
    minOrderQuantity: 8,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001'],
    description: 'Lithium chemicals producer from the Lithium Triangle.',
    specialties: ['Lithium Carbonate', 'Lithium Chloride']
  },
  {
    id: '9',
    name: 'Mineral Resources',
    verificationTier: 'silver',
    rating: 4.5,
    reviewCount: 178,
    transactionCount: 512,
    pricePerUnit: 67500,
    currency: 'USD',
    unit: 'MT',
    location: 'Perth',
    country: 'Australia',
    productType: 'processed',
    purityLevel: '99.5',
    responseTime: '< 4 hours',
    yearsInBusiness: 20,
    hasBulkDiscount: true,
    minOrderQuantity: 10,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
    description: 'Diversified mining services with lithium operations.',
    specialties: ['Spodumene Concentrate', 'Lithium Hydroxide']
  },
  {
    id: '10',
    name: 'European Lithium',
    verificationTier: 'bronze',
    rating: 4.2,
    reviewCount: 67,
    transactionCount: 156,
    pricePerUnit: 74000,
    currency: 'USD',
    unit: 'MT',
    location: 'Vienna',
    country: 'Austria',
    productType: 'raw',
    purityLevel: '99',
    responseTime: '< 24 hours',
    yearsInBusiness: 6,
    hasBulkDiscount: false,
    minOrderQuantity: 15,
    availability: 'contact',
    certifications: ['ISO 9001'],
    description: 'European source for battery-grade lithium.',
    specialties: ['EU Sourced', 'Sustainable Mining']
  },
  {
    id: '11',
    name: 'Lithium Americas Corp',
    verificationTier: 'silver',
    rating: 4.6,
    reviewCount: 134,
    transactionCount: 398,
    pricePerUnit: 73500,
    currency: 'USD',
    unit: 'MT',
    location: 'Vancouver',
    country: 'Canada',
    productType: 'compound',
    purityLevel: '99.9',
    responseTime: '< 4 hours',
    yearsInBusiness: 14,
    hasBulkDiscount: true,
    minOrderQuantity: 5,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'ISO 14001'],
    description: 'North American lithium producer with Argentina operations.',
    specialties: ['Battery Grade', 'Technical Lithium']
  },
  {
    id: '12',
    name: 'POSCO Chemical',
    verificationTier: 'gold',
    rating: 4.7,
    reviewCount: 256,
    transactionCount: 876,
    pricePerUnit: 77000,
    currency: 'USD',
    unit: 'MT',
    location: 'Seoul',
    country: 'South Korea',
    productType: 'processed',
    purityLevel: '99.9',
    responseTime: '< 2 hours',
    yearsInBusiness: 30,
    hasBulkDiscount: true,
    minOrderQuantity: 3,
    availability: 'in-stock',
    certifications: ['ISO 9001', 'IATF 16949', 'ISO 14001'],
    description: 'Premium cathode materials and lithium compounds.',
    specialties: ['NCM Cathodes', 'Lithium Hydroxide']
  }
];

// todo: remove mock functionality
export const reviews: Review[] = [
  {
    id: 'r1',
    supplierId: '1',
    author: 'Michael Chen',
    company: 'Tesla Battery Division',
    rating: 5,
    date: '2024-11-15',
    content: 'Exceptional quality and consistent supply. Their battery-grade lithium hydroxide meets our strictest specifications. Response time is incredible.',
    verified: true,
    helpful: 45
  },
  {
    id: 'r2',
    supplierId: '1',
    author: 'Sarah Williams',
    company: 'LG Energy Solution',
    rating: 5,
    date: '2024-10-28',
    content: 'We have been working with Albemarle for 5 years now. Their technical support and documentation are best-in-class.',
    verified: true,
    helpful: 32
  },
  {
    id: 'r3',
    supplierId: '1',
    author: 'Hans Mueller',
    company: 'BMW Group Procurement',
    rating: 4,
    date: '2024-09-12',
    content: 'Reliable supplier with excellent certifications. Minor delays during peak season but overall very satisfied.',
    verified: true,
    helpful: 28
  },
  {
    id: 'r4',
    supplierId: '2',
    author: 'Carlos Rodriguez',
    company: 'Panasonic Energy',
    rating: 5,
    date: '2024-11-02',
    content: 'SQM delivers consistent quality from their Atacama operations. Great for large-scale procurement needs.',
    verified: true,
    helpful: 38
  },
  {
    id: 'r5',
    supplierId: '3',
    author: 'Wei Zhang',
    company: 'CATL Procurement',
    rating: 5,
    date: '2024-11-20',
    content: 'Fastest response times in the industry. Ganfeng has become our primary lithium supplier.',
    verified: true,
    helpful: 52
  }
];

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(s => s.id === id);
};

export const getReviewsBySupplier = (supplierId: string): Review[] => {
  return reviews.filter(r => r.supplierId === supplierId);
};
