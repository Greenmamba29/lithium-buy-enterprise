# LithiumBuy.com - Enterprise Marketplace Design Guidelines

## Design Approach
Enterprise B2B directory inspired by Salesforce AppExchange and Microsoft Partner Directory. Prioritizes data clarity, trust signals, and efficient workflows over decorative elements for high-value lithium supply transactions.

## Core Principles
1. **Enterprise Credibility**: Professional aesthetic for B2B confidence
2. **Data Clarity**: Clear hierarchy for filtering/comparison
3. **Guided Workflows**: Search → Detail → Quote/Telebuy → Transaction
4. **Trust Indicators**: Verification badges, ratings, transparency

---

## Typography

**Fonts**: Inter (headings/UI/data), Source Sans Pro (body/descriptions)

**Scale**:
- H1: 48px/56px, 700 (hero)
- H2: 36px/44px, 600 (sections)
- H3: 24px/32px, 600 (card headers)
- H4: 18px/24px, 600 (subsections)
- Body Large: 16px/24px, 400
- Body: 14px/20px, 400
- Small: 12px/18px, 500 (labels/badges)

---

## Colors

**Primary**: Enterprise Navy #1B365D (buttons/headers), Professional Blue #4A90E2 (links/info), Deep Blue #003D82 (nav/footer)

**Accent**: Success Green #50C878 (verified/positive), CTA Orange #FF6B35 (primary CTAs), Gold #D4AF37 (premium)

**Neutrals**: Background #F8F9FA, Cards #FFFFFF, Text Primary #2C3E50, Text Secondary #6C757D, Borders #DEE2E6

**Verification Tiers**: Gold #D4AF37, Silver #C0C0C0, Bronze #CD7F32

---

## Layout & Spacing

**Tailwind Units**: 4, 6, 8, 12, 16, 20, 24
- Sections: py-20 to py-24
- Cards: p-6
- Components: gap-4 to gap-8

**Grid**: Container max-w-7xl mx-auto px-6, Results grid-cols-1 md:grid-cols-2 lg:grid-cols-3, Filter sidebar 320px fixed (desktop), collapsible (mobile)

---

## Components

### Navigation
Sticky header: logo left, nav center, CTA right. Mega menu for categories, hamburger menu (mobile).

### Hero (Search Page)
- H1: "Find Lithium Suppliers & Products"
- Large search with auto-suggest
- Quick filter pills (Product Type, Purity, Location)
- Background: Subtle gradient overlay on industrial imagery (full-width, 600px height, rgba(27, 54, 93, 0.7))

### Filter Sidebar
- Collapsible accordion groups: Product Type, Purity Level, Price Range (dual slider), Location, Verification Tier
- Multi-select checkboxes with counts
- Sticky "Apply Filters" button + "Clear All" link
- Active filter chips above results

### Supplier Cards
- Logo 80x80px (center top)
- Company name (H4)
- Verification badge (32px, top-right, tier colored)
- Star rating + review count
- Price/unit (20px bold)
- Location icon + text
- 2-3 spec pills
- Comparison checkbox (top-left)
- Buttons: "Quick View" (secondary), "Request Quote" (primary orange)
- **Hover**: translateY(-4px), shadow increase (200ms ease)

### Supplier Profile Page

**Header**:
- Logo 120x120px, company name (H1), verification badge w/tooltip
- Star rating + reviews + transactions
- Response time indicator
- CTAs: "Request Quote" (orange), "Schedule Telebuy" (navy)

**Tabs** (sticky): Overview, Products & Pricing, Certifications, Reviews, About

**Products Table**: Striped rows, sortable columns (Product, Purity, Price/Unit, MOQ, Availability), "Bulk Discount" badges

**Pricing Tiers**: Card layout, visual price gradient, "Request Custom Quote" CTA

**Trust Section**: Years in business (large number), certification badge grid, insurance/compliance

**Reviews**: 5-star cards with verified purchase badge, helpful voting, rating breakdown bar chart

**Similar Suppliers**: Horizontal carousel with mini cards

**Images**: 3-5 product photos (800x600px main, 120x120px thumbnails), lightbox gallery

### Telebuy Flow

**Scheduler**:
- Calendar (month view, highlighted slots)
- Time zone + duration selector (30/60/90 min)
- Video call badge

**DocuSign**:
- Document preview thumbnail
- "Initiate DocuSign" button
- Progress: Schedule → Review → Sign → Payment

**Order Summary**:
- Line items table
- Commission structure: "Our service fee: 3-5% of transaction" (transparent, secondary text)
- Total (bold, large)
- Payment selector
- "Confirm Order" (orange primary)

### Comparison Tool
- Triggered by 2+ selected checkboxes
- Sticky bottom bar: "Compare (X) Suppliers"
- Modal/full-page side-by-side table
- Highlight differences (colored cells)
- "Select This Supplier" CTAs per column

### Forms & Inputs
- Height 48px, rounded-lg, border-2
- Labels: 14px, 600, mb-2
- Placeholder: #6C757D
- Focus: Primary blue ring
- Error: Red border + message
- Textareas: 120px min-height
- Multi-step forms: Progress indicator

### Buttons
- **Primary** (CTA Orange): px-8 py-3, rounded-lg, shadow-md, hover:shadow-lg
- **Secondary** (Navy): White text, same sizing
- **Tertiary**: Border-2 outline, transparent, hover:bg-gray-50
- **Icon**: 40x40px rounded-full
- **Disabled**: opacity-50, cursor-not-allowed

### Badges & Labels
- Verification: 32px circular, tier colors, drop-shadow
- Product pills: px-3 py-1, rounded-full, colored backgrounds
- Status: "In Stock" (green), "Limited" (orange), "Contact" (gray)
- "Bulk Discount": Small ribbon, gold

### Data Visualization
- Stars: Gold #D4AF37, 20px
- Price charts: Horizontal bars
- Review distribution: Vertical bar chart with %
- Stock: Progress bars

---

## Responsive

**Mobile (<768px)**: Filter modal overlay, single-column cards, sticky bottom buttons (44px min touch), tabs → accordion

**Tablet (768-1024px)**: 2-column grid, 280px sidebar, comparison modal

**Desktop (>1024px)**: 3-column grid, 320px sidebar, side-by-side comparison, hover states active

---

## Interactions

**Animations** (minimal):
- Card hover: 200ms ease
- Filter updates: 300ms fade
- Modal: 250ms scale + fade
- Button hover: 150ms shadow
- Loading: Skeleton screens (pulsing gray)
- Toasts: Slide from top-right

**No animations**: Form inputs, text, nav links, badges

---

## Accessibility (WCAG AA)
- Contrast: 4.5:1 minimum for text
- Keyboard navigation for all interactives
- Focus: 2px blue ring
- ARIA labels on icon buttons
- Alt text on images
- Clear form error messaging
- Skip links

---

## Trust Elements
- Commission clearly labeled in order summary
- Verification badge tooltips (tier criteria)
- Response time guarantees
- Transaction counts + years in business on profiles
- Verified purchase badges on reviews
- Secure payment icons (footer)
- SSL display in Telebuy

---

**Logo Placeholders**: Gray background with initials if missing. Square 80x80px (cards), 120x120px (profiles). **Certifications**: 60x60px, grayscale, 4-6 per row grid.