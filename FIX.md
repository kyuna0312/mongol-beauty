Project: Full Refactor of E-commerce Platform (Admin + Frontend + CMS + Korea Ordering)

Goal:
Build a scalable, modern e-commerce system with clean UX inspired by cloudnine.mn, fix CMS sync issues, and support Korea-based product ordering.

--------------------------------------------------
1. UI / UX SYSTEM (Cloudnine-style)
--------------------------------------------------
Reference:
- https://cloudnine.mn

Design Goals:
- Minimal, clean, modern aesthetic
- Product-first layout
- Soft colors, spacing-focused UI
- Mobile-first responsive design

Typography:
- Primary: Roboto
- Secondary: Playfair Display
- Accent/UI: Montserrat

Implementation:
- Global design system:
  - Typography scale (H1–H6, body, caption)
  - Spacing system (8px grid)
  - Reusable components (buttons, cards, inputs)

--------------------------------------------------
2. PRODUCT SYSTEM (Enhanced)
--------------------------------------------------

A. Product Description (NEW REQUIREMENT)
- Product description should support:
  - Rich text (HTML/Markdown)
  - Embedded images inside description
- Example:
  - Long-form content like Korean cosmetic sites
  - Before/after images
  - Usage instructions with visuals

Backend:
- Store:
  - description_html (TEXT)
- OR structured blocks:
  - type: text | image | mixed

Frontend:
- Render safely (sanitize HTML)
- Support image sections inside description

--------------------------------------------------
3. CATEGORY SYSTEM (Scalable)
--------------------------------------------------
- Multi-level categories:
  - parent_id (self-referencing)
- API:
  - Nested tree OR flat list
- Admin:
  - Drag & drop tree structure (optional)

--------------------------------------------------
4. PRODUCT LIST FIX (Pagination)
--------------------------------------------------
Fix:
- Backend:
  - limit + offset correct
  - return totalCount
- Frontend:
  - correct pagination UI
  - show total products

--------------------------------------------------
5. ADMIN PANEL REFACTOR
--------------------------------------------------
Architecture:
- Modular structure:
  - components/
  - services/
  - hooks/
  - state/

State Management:
- React Query (recommended)

Improvements:
- Lazy loading
- Clean code
- Reusable UI

--------------------------------------------------
6. ORDER SYSTEM (Enhanced)
--------------------------------------------------

A. Order Notes / Tags:
- "байнга хүн байна"
- "ирэхээсээ өмнө яриа"
- "нялх хүүхэдтэй"
- "зөвхөн оройн цагаар"

Implementation:
- Store as array
- UI:
  - Multi-select in checkout
  - Display in admin panel

--------------------------------------------------
7. USER SYSTEM
--------------------------------------------------
Roles:
- USER
- VIP

VIP Features:
- 20% discount
- Voucher system

Voucher:
- code
- discount
- expiry

Logic:
- Apply discount at checkout
- Show adjusted pricing in UI

--------------------------------------------------
8. KOREA ORDERING SYSTEM (IMPORTANT)
--------------------------------------------------

A. Product Flag:
- isKoreanProduct = true

B. Korea Order Flow:
- When ordering Korean product:
  - Status flow:
    1. Requested
    2. Ordered from Korea
    3. Arrived in warehouse
    4. Shipped locally
    5. Delivered

C. Additional Fields:
- supplier_name (Korea vendor)
- korea_tracking_id
- estimated_days (e.g. 7–14 days)

D. UI:
- Show message:
  - "This product will be ordered from Korea. Delivery may take longer."
- Show tracking status in user dashboard

--------------------------------------------------
9. CMS SYSTEM (CRITICAL FIX)
--------------------------------------------------
Pages:
- Privacy
- Shipping
- Returns
- FAQ
- About

Problem:
- Admin changes not reflected in frontend

--------------------------------------------------
10. CMS FIX (DETAILED)
--------------------------------------------------

Backend:
- Table: pages
  - id
  - slug (unique)
  - content (HTML)
  - updated_at

API:
- GET /api/pages/:slug
- PUT /api/pages/:slug

Fix:
- Ensure update query works
- Validate slug mapping

Frontend:
- Remove static content
- Fetch dynamically
- Re-render on load

Caching:
- Disable or control cache:
  - Cache-Control: no-cache

--------------------------------------------------
11. ADMIN UX IMPROVEMENTS
--------------------------------------------------
- Show:
  - Success toast
  - Error message
  - Loading spinner
- Add preview mode for CMS pages

--------------------------------------------------
12. PERFORMANCE
--------------------------------------------------
- Image optimization (lazy load)
- Code splitting
- API caching (except CMS)

--------------------------------------------------
13. TESTING
--------------------------------------------------
Test CMS:
✔ Update Privacy page  
✔ Check DB  
✔ Check API  
✔ Check frontend  

Test Korea flow:
✔ Order Korean product  
✔ Track status  

--------------------------------------------------
EXPECTED OUTPUT
--------------------------------------------------
1. Full system architecture (frontend + backend)
2. CMS bug root cause + fix
3. Korea order system design
4. Product description (image support) implementation
5. Code examples (React + NestJS preferred)
