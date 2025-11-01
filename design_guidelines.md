# Sora Invite Code Sharing Community - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Minimal SaaS Dashboard Pattern)

Drawing inspiration from modern utility-focused platforms like Linear, Vercel, and Stripe's dashboard - prioritizing clarity, efficiency, and trustworthiness. The design emphasizes functional excellence over decorative elements, ensuring users can quickly understand code availability and complete their tasks.

**Key Design Principles:**
1. **Clarity First:** Every element serves a clear purpose in the code distribution flow
2. **Trust & Transparency:** Clean layouts that build confidence in the system
3. **Efficient Interaction:** Minimal steps from arrival to code acquisition
4. **Data Visibility:** Statistics and status information prominently displayed

---

## Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - for UI elements, body text, statistics
- Monospace: 'JetBrains Mono' (Google Fonts) - for displaying invite codes

**Type Scale:**
- Hero/Page Titles: text-5xl font-bold (48px)
- Section Headings: text-3xl font-semibold (30px)
- Card Titles: text-xl font-semibold (20px)
- Body Text: text-base font-normal (16px)
- Labels/Meta: text-sm font-medium (14px)
- Codes Display: text-2xl font-mono tracking-wider (24px monospace)
- Statistics Numbers: text-4xl font-bold (36px)

---

## Layout System

**Spacing Primitives:**
Use Tailwind units of **2, 4, 8, 12, 16, 24** for consistent rhythm throughout (p-2, gap-4, mt-8, mb-12, py-16, space-y-24)

**Container Strategy:**
- Max-width wrapper: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Dashboard sections: max-w-6xl mx-auto
- Form containers: max-w-2xl mx-auto
- Admin tables: w-full (within max-w-7xl container)

**Grid Patterns:**
- Statistics cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Admin dashboard metrics: grid-cols-2 lg:grid-cols-4
- Form layout: Single column for simplicity

---

## Component Library

### Public-Facing Website

**1. Hero Section (Home/Dashboard)**
- Clean, centered layout with minimal height (60vh)
- Large statistic display: "X codes available" as primary focus
- Subtle description text explaining the community model
- Prominent "Request a Code" CTA button
- Trust indicators below: "Community-powered • Free • Instant delivery"

**2. Statistics Display**
- Large numerical display (text-4xl font-bold)
- Supporting label below (text-sm uppercase tracking-wide)
- Contained in subtle card with rounded corners (rounded-xl)
- Icon prefix for visual hierarchy

**3. Code Request Flow**

*Step 1 - Verification Screen:*
- Centered card layout (max-w-md)
- Clear heading: "Verify you're human"
- Google reCAPTCHA v2 embedded
- Descriptive text explaining the verification step

*Step 2 - Code Delivery Screen:*
- Prominent code display in monospace font
- Code shown in distinct container with high contrast
- "Copy Code" button with copy-to-clipboard functionality
- Success message after copy action
- Visual separator before pay-it-forward section

*Step 3 - Pay It Forward Form:*
- Clear explanation header with icon
- Four distinct input fields labeled "Code 1" through "Code 4"
- Each input: rounded-lg border with generous padding (px-4 py-3)
- Input placeholder: "SORA-XXX-XXX" pattern
- Submit button: Full-width, prominent
- Character limit indicator if needed

**4. Thank You Screen**
- Centered success message with check icon
- Brief confirmation text
- "Return to Home" link
- Optional: Social sharing encouragement

### Navigation

**Public Site Header:**
- Minimal fixed header (h-16)
- Logo/site name left-aligned
- "Available Codes" counter in header (desktop only)
- "Admin Login" link right-aligned (text-sm)

**Admin Panel Navigation:**
- Sidebar layout (w-64 fixed on desktop)
- Vertical nav items with icons
- Active state indication
- Collapsible on mobile (hamburger menu)

### Admin Panel

**1. Admin Dashboard**
- Four metric cards in grid layout
- Each card displays:
  - Large number (text-4xl)
  - Label (text-sm uppercase)
  - Subtle icon
  - Optional trend indicator

**2. Code Management Table**
- Full-width responsive table
- Columns: Code | Status | Date Added | Date Distributed | Actions
- Status badges with rounded-full styling
- Monospace font for code column
- Action buttons (icon-only) for edit/delete
- Pagination at bottom
- Search/filter bar above table

**3. Add Codes Interface**
- Modal overlay or dedicated page
- Multiple input options:
  - Single code entry
  - Bulk entry (textarea for multiple codes)
- Validation preview before submission
- Clear success/error messaging

**4. Verification Queue**
- Similar table layout to code management
- Filtered view showing only "Distributed" status codes
- Bulk action options for status updates
- Time elapsed since distribution

### Forms & Inputs

**Text Inputs:**
- Rounded corners (rounded-lg)
- Clear labels above (text-sm font-medium)
- Generous padding (px-4 py-3)
- Focus ring visible and distinct
- Error states with descriptive text below

**Buttons:**
- Primary CTA: Large, full-width on mobile, auto width on desktop (px-8 py-3)
- Secondary: Outlined variant (border-2)
- Icon buttons: Square (w-10 h-10) with centered icon
- Disabled state clearly indicated
- Rounded corners (rounded-lg for standard, rounded-full for icon-only)

**Status Badges:**
- Pill shape (rounded-full)
- Compact padding (px-3 py-1)
- Text-xs font-medium
- States: Available, Distributed, Used, Invalid

### Cards & Containers

**Standard Card:**
- Rounded corners (rounded-xl)
- Subtle shadow (shadow-sm)
- Padding: p-6 for content
- Hover state on interactive cards (shadow-md transition)

**Code Display Container:**
- Prominent border (border-2)
- Larger padding (p-8)
- Centered content
- Monospace font for code

### Data Visualization

**Statistics:**
- Number-focused design
- Icon accompaniment
- Percentage changes where relevant (with up/down indicators)
- Sparkline graphs (optional, using Chart.js via CDN)

---

## Icons

**Library:** Heroicons (via CDN)
- Use outline variant for navigation/secondary actions
- Use solid variant for status indicators/primary elements
- Consistent sizing: w-5 h-5 for inline, w-6 h-6 for standalone

**Key Icons:**
- Check circle: Success states
- X circle: Error states  
- Clock: Time-related info
- Users: Community indicators
- Code brackets: Code-related features
- Shield check: Verification
- Chart bar: Statistics
- Cog: Settings/admin

---

## Responsive Behavior

**Breakpoints:**
- Mobile-first approach
- sm: 640px (tablet portrait)
- md: 768px (tablet landscape)
- lg: 1024px (desktop)

**Key Adaptations:**
- Admin sidebar: Fixed on lg+, collapsible drawer on mobile
- Statistics grid: Single column on mobile, 2 columns on md, 4 columns on lg
- Tables: Horizontal scroll on mobile, full display on lg
- Forms: Full-width on mobile, centered with max-width on desktop
- Navigation: Hamburger menu on mobile, horizontal on desktop (public site)

---

## Accessibility

- Minimum touch target: 44x44px for all interactive elements
- Form inputs include visible labels (never placeholder-only)
- Focus indicators clearly visible on all interactive elements
- Semantic HTML structure throughout
- ARIA labels for icon-only buttons
- Color contrast meets WCAG AA standards minimum
- Status conveyed through icons + text, not color alone

---

## Animations

**Minimal Motion Philosophy:**
- Page transitions: None
- Hover states: Subtle scale (scale-105) or shadow changes only
- Loading states: Simple spinner or skeleton screens
- Success feedback: Gentle check mark animation
- Modal entry/exit: Fade + slight scale (200ms duration)
- Copy button: Brief pulse effect on success

**Use transitions for:**
- Button hover/focus states (transition-all duration-200)
- Dropdown menus (transition-opacity duration-150)
- Modal overlays (transition-opacity duration-300)

---

## Images

**No large hero images required** - This is a utility-focused application. Visual identity comes from clean typography and layout.

**Icons Only:**
- Use icon library (Heroicons) for all visual elements
- Optional: Small decorative illustration on thank you screen (max 200x200px, centered)
- Admin profile: Small avatar placeholders (w-8 h-8 rounded-full)

---

## Page-Specific Layouts

**Public Homepage:**
1. Minimal header (h-16)
2. Hero section with statistics (60vh, centered content)
3. How it works section (3-column grid on lg, explaining flow)
4. Footer with links and community info

**Code Request Flow:**
- Three sequential screens (Verify → Receive → Contribute)
- Each screen: Centered card (max-w-2xl), clear progression
- Consistent padding: py-16 on container

**Admin Dashboard:**
- Sidebar navigation (w-64)
- Main content area (full remaining width)
- Metrics grid at top
- Quick actions/recent activity below

**Admin Code Management:**
- Header with search and "Add Codes" button
- Full-width table
- Pagination footer

This design creates a professional, trustworthy platform that prioritizes function and clarity—perfect for a community-driven utility tool.