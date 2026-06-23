# X100 — UI Language & Design System

## Table of Contents
1. [Tech Stack](#1-tech-stack)
2. [Design Tokens](#2-design-tokens)
3. [Typography](#3-typography)
4. [Layout Patterns](#4-layout-patterns)
5. [Animation System](#5-animation-system)
6. [Navigation & Global UI](#6-navigation--global-ui)
7. [Home Page](#7-home-page)
8. [Showcase / Collections Page](#8-showcase--collections-page)
9. [Collection Detail Page](#9-collection-detail-page)
10. [About Page](#10-about-page)
11. [Contact Page](#11-contact-page)
12. [Reusable Components](#12-reusable-components)
13. [Sound Effects](#13-sound-effects)
14. [Photo Data Model](#14-photo-data-model)
15. [Dark Mode](#15-dark-mode)
16. [Key Implementation Patterns](#16-key-implementation-patterns)

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Icons | lucide-react |
| Fonts | Inter (sans), Old London (display/headings) |
| Theme | next-themes |
| Form | react-hook-form + @formspree/react |
| Date Picker | react-day-picker |
| Photo Gallery | react-photo-album (masonry) |
| Charts | recharts |
| Class Merge | clsx + tailwind-merge (via `cn()` utility) |
| Variants | class-variance-authority (cva) |
| Toast | sonner |
| Drawer | vaul |
| Image Lightbox | yet-another-react-lightbox |
| Carousel | embla-carousel-react |
| Command Palette | cmdk |

---

## 2. Design Tokens

### Color Palette (HSL)

All colors use HSL with `--hue saturation lightness` format via CSS custom properties.

#### Light Mode (`:root`)
```
--background: 0 0% 100%;        // white
--foreground: 0 0% 0%;           // black
--card: 0 0% 100%;
--card-foreground: 0 0% 0%;
--primary: 0 0% 0%;              // black (main text/actions)
--primary-foreground: 0 0% 100%; // white (text on primary)
--secondary: 0 0% 96%;           // near-white gray
--secondary-foreground: 0 0% 0%;
--muted: 0 0% 96%;
--muted-foreground: 0 0% 45%;    // gray for secondary text
--accent: 0 0% 96%;
--accent-foreground: 0 0% 0%;
--border: 0 0% 90%;             // light gray borders
--input: 0 0% 90%;
--ring: 0 0% 0%;
--radius: 0.5rem;
```

#### Dark Mode (`.dark`)
```
--background: 0 0% 0%;           // black
--foreground: 0 0% 100%;         // white
--primary: 0 0% 100%;            // white
--primary-foreground: 0 0% 0%;   // black
--secondary: 0 0% 15%;           // dark gray
--muted-foreground: 0 0% 65%;    // mid-gray
--border: 0 0% 15%;
```

#### Tailwind Mapped Colors
```
border, input, ring, background, foreground,
primary, primary-foreground,
secondary, secondary-foreground,
destructive, destructive-foreground,
muted, muted-foreground,
accent, accent-foreground,
popover, popover-foreground,
card, card-foreground
```

### Spacing / Layout
- Max content width: `max-w-7xl` (1280px)
- Section padding X: `px-4 md:px-8`
- Section padding Y: `py-16` to `py-32`
- Card border radius: `rounded-2xl` (16px), `rounded-3xl` (24px)
- Container border radius (CTA sections): `rounded-3xl`
- Soft shadow utility (global CSS): `shadow-soft` = `0 2px 4px rgba(0,0,0,0.05)`

### Font Sizes
- Body: `text-base` (16px) → global CSS sets `font-size: 1.125rem` (18px) on body
- Small: `text-sm` (14px)
- Section headings: `text-3xl md:text-4xl`
- Hero/Page titles: `text-4xl md:text-5xl`
- Card titles: `text-2xl` to `text-3xl md:text-4xl`

---

## 3. Typography

### Font Stack
```css
--font-inter: "Inter", sans-serif;       // body text
--font-old-london: "Old London";          // all headings (h1-h6)
```

- **All headings** (`h1`-`h6`) use `font-family: var(--font-old-london)`, weight 400, `letter-spacing: 0.07em`
- **Body** uses Inter via Tailwind `font-sans` / `var(--font-inter)`
- Font utility class: `font-old-london`
- Inter is loaded via `next/font/google`
- Old London is self-hosted in `/public/fonts/Old London Font.woff`
- Body has `font-size: 1.125rem` (18px), `antialiased`, `overflow-x: hidden`

---

## 4. Layout Patterns

### Page Shell
```tsx
<div className="min-h-screen">
  <section className="relative h-[50vh] w-full">   // hero with bg image
    <Image fill className="object-cover" />
    <div className="absolute inset-0 bg-black/50" />  // overlay
    <motion.div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4" />
  </section>

  <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">  // content
    // content
  </section>

  {/* CTA Block - distinctive container */}
  <section className="min-w-[90%] justify-self-center mr-4 ml-4 py-20 my-20 px-4 md:px-8 rounded-3xl border-[1px] border-border">
    <div className="max-w-7xl mx-auto text-center" />
  </section>
</div>
```

### Grid Systems
- **2 columns**: `grid md:grid-cols-2 gap-12`
- **3 columns**: `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- **4 columns (footer)**: `grid grid-cols-1 md:grid-cols-4 gap-8`
- **3 columns (philosophy)**: `grid md:grid-cols-3 gap-8`
- **Bento hero**: custom `grid-cols-8 grid-rows-[1fr_0.5fr_0.5fr_1fr]`

### Page Hero Pattern (every inner page)
1. Full-width section `h-[50vh]`
2. Background image with `object-cover` + overlay `bg-black/50`
3. Centered title + subtitle
4. Fade-up animation on mount (`opacity:0, y:20` → `opacity:1, y:0`)

### CTA Block Pattern
- `min-w-[90%] justify-self-center mr-4 ml-4` — centered with margins
- `rounded-3xl border-[1px] border-border`
- `py-20 my-20`
- `text-center`
- `AnimatedButton` with icon
- Used on: Home, About, Contact, Collection detail

---

## 5. Animation System

### Framer Motion — Standard Entry Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  viewport={{ once: true }}
/>
```

### Animation Variants Used Per Scenario

| Variant | When | Properties |
|---------|------|------------|
| Fade-up (default) | sections entering viewport | `opacity:0, y:20` → `opacity:1, y:0`, dur: 0.5-0.6 |
| Slide-left | text blocks on desktop | `opacity:0, x:-20` → `opacity:1, x:0` |
| Slide-right | images on desktop | `opacity:0, x:20` → `opacity:1, x:0` |
| Page enter | hero/title on page load | `animate` (not `whileInView`), dur: 0.8, no viewport |
| Stagger children | lists, FAQ | `staggerChildren: 0.1, delayChildren: 0.3` |
| Hover lift | cards | `whileHover={{ y: -5, transition: { duration: 0.2 } }}` |
| Hover scale (social) | social icons | `whileHover={{ scale: 1.1 }}`, `whileTap={{ scale: 0.95 }}` |
| Mobile menu | slide-in drawer | `spring`, damping 25, stiffness 300, x:`100%`→0 |

### Hero Gallery Scroll Animation
Custom scroll-driven animation using `useScroll()` and `useTransform()`:
- **ContainerScroll**: wraps the entire section, provides `scrollYProgress` via context
- **BentoGrid**: CSS grid with variant layouts (default 5-cell, threeCells, fourCells)
- **BentoCell**: translates from `-35%` to `0%` and scales `0.5` to `1` based on scroll progress
- **ContainerScale**: centered overlay that fades out (opacity `1→0`, scale `1→0`) as user scrolls
- Container height: `h-[350vh]` to create scroll room
- The grid is `sticky left-0 top-0 z-0 h-screen`

### Image Hover Effects (Collection Cards)
```css
group-hover:scale-110        // image zooms
group-hover:opacity-80       // image dims
group-hover:opacity-90       // overlay darkens
```

### Button Hover Icon Animation (global CSS)
```css
.btn-icon {
  opacity: 0; transform: translateX(-10px); width: 0;
  transition: all 0.3s ease;
}
.btn:hover .btn-icon {
  opacity: 1; transform: translateX(0); width: auto; margin-left: 0.5rem;
}
```

### Arrow Icon Animation (collection links)
```css
group-hover:translate-x-2    // arrow slides right
opacity-0 group-hover:opacity-100  // arrow fades in
```

---

## 6. Navigation & Global UI

### Header
- **Position**: `fixed top-2 left-2 right-2 z-50`
- **Height**: 60px (`header-height` class)
- **Behavior**: hides on scroll down, shows on scroll up (different thresholds for mobile vs desktop)
- **Background**: `bg-transparent` → `bg-background backdrop-blur-md shadow-sm` when scrolled
- **Background blur**: applied to scrolled background
- **Brand**: "X100" text in `font-old-london text-2xl`
- **Desktop nav**: centered (`absolute left-1/2 transform -translate-x-1/2`)
- **Mobile nav**: full-screen slide-in from right (`fixed inset-0 z-[100] bg-primary-foreground backdrop-blur-lg flex flex-col min-h-screen rounded-3xl border-border border-[1px]`)
  - Menu items: `text-3xl font-old-london`
  - Theme toggle included
  - Spring animation type

### Navigation Items
```
Home, Showcase, About, Contact
```
Active state: `border-b-[1px] border-border`

### Footer
- `bg-background border-t border-border py-12 px-4 md:px-8`
- 4-column grid (md:col-span-2 for brand column)
- **Brand** + description + social icons
- **Quick Links**: Showcase, About, Contact
- **Contact**: Email, Location
- Social icons (framer-motion hover:scale-1.1): Instagram, Twitter, Facebook, Youtube, Github (all link to GitHub placeholder)
- ThemeToggle included
- Animate on scroll (`whileInView`)
- Uses `useDisableRightClick()` hook to protect images

### Theme Toggle
- `relative w-10 h-10 flex items-center justify-center rounded-full bg-secondary`
- Spring-animated icon rotation (`0`→`180` deg)
- Icons: Sun (dark mode), Moon (light mode)
- Plays shutter sound on toggle
- Updates Safari theme-color meta tag
- Placeholder div (w-10 h-10) before mount to prevent layout shift
- Hidden on mobile via `.toggle-container` class

---

## 7. Home Page

### Structure (top to bottom)
1. **Header spacer**: `<div className="header-height"></div>`
2. **Hero Gallery Scroll**: `HeroGalleryScroll` component (scroll-driven animation)
3. **Introduction Section**: 2-column grid (text left, image right) with fade-in animations
4. **Layout Grid**: `LayoutGridDemo` — interactive image grid with expand/collapse
5. **CTA Section**: "Collaborate?" call-to-action
6. **Featured Collections**: grid with animated cards + "View All Collections" button

### Hero Section (HeroGalleryScroll)
- **Container**: 350vh height for scroll room
- **Bento grid**: 5 images laid out in CSS grid (8 columns, 4 rows)
  - Image 1: `col-span-8 md:col-span-6 row-span-3` (largest)
  - Image 2-3: hidden on mobile, `col-span-2 row-span-2` on desktop
  - Image 4-5: `col-span-4 md:col-span-3` each
- **Overlay**: centered title "X100" + description + 2 buttons that fade out on scroll
- Scroll-driven: images translate up + scale to full, title fades out

### LayoutGrid Demo (layout-image-grid.tsx)
- Interactive masonry grid (3 columns desktop, 1 column mobile)
- Uses framer-motion `layoutId` for animated transitions
- Click expands a card to full-screen overlay with content
- Click outside closes expanded card
- Cards: Tokyo Nights, Urban Portraits, New Zealand, Iceland
- Each card has overlay `bg-black opacity-60` on select

---

## 8. Showcase / Collections Page

### Structure
1. **Hero**: 50vh with background image, title "Photography Collections"
2. **Tag Filters**: centered, horizontal list of clickable tags
3. **Collections Grid**: Suspense-wrapped, grouped collections (1 featured + 6 regular per group)

### Tag Filters
- URL-based filtering (`useSearchParams`, `useRouter`)
- Each tag: `rounded-full px-3 py-1`
- Active: `bg-primary text-primary-foreground`
- Inactive: `bg-gray-100 text-gray-700` / dark: `bg-gray-600 text-gray-300`
- Hover: `scale-1.05`, Tap: `scale-0.95`
- Sequential entry animation with `index * 0.05` delay

### Featured Collection Card (first in group)
- Full width, 500px height
- Dark gradient overlay (`bg-gradient-to-t from-black/90 via-black/50 to-transparent`)
- Tags with `bg-white/30 backdrop-blur-sm`
- "Explore Collection" underline link with arrow
- Hover: image scale-105, overlay darkens, arrow slides right

### Regular Collection Card (2nd-7th in group)
- 3-column grid
- 320px height image
- Bottom-positioned content with tags
- Arrow icon hidden until hover (`opacity-0 -translate-x-2` → `opacity-100 translate-x-0`)
- All cards use shutter sound on click

---

## 9. Collection Detail Page

### Structure
1. **Hero**: 50vh with cover image, title, description, tag list
2. **Description**: full-width text block (`max-w-5xl`)
3. **Photo Gallery**: masonry layout with `react-photo-album`
4. **Featured Collections**: same component reused from home page

### Photo Gallery
- Masonry layout, responsive columns (1 mobile, 3 desktop)
- Custom renderer using Next.js `Image` component
- Rounded corners: 20px (also set via global CSS `.react-photo-album--image`)
- Hover: scale-1.02 + gradient overlay + metadata panel appears
- **Lightbox**: full-screen overlay with:
  - Navigation: click left/right third, keyboard arrows, prev/next buttons
  - Photo counter: "1 of 20"
  - Camera metadata strip at bottom
  - Thumbnail strip at bottom with scroll
  - Active thumbnail: border-white scale-110
  - Close with X button or Escape key

### Photo Metadata Display
- Hover overlay: camera name, lens, aperture, shutter speed, ISO, focal length, date
- Styled as `bg-black/40 backdrop-blur-sm rounded-lg`
- Lightbox bar: camera model + focal length + aperture + shutter speed + ISO

---

## 10. About Page

### Structure
1. **Hero**: 50vh "About Me"
2. **Bio**: 2-column grid (image + text)
3. **Philosophy**: 3 cards with hover lift
4. **Timeline**: year-based list
5. **CTA**: "Collaborate?" section

### Bio Section
- Stats row: Camera icon + "Fujifilm x100vi & Leica M10", Globe + "30+ Countries", Award + "Award-winning", Users + "Workshops & Mentoring"

### Philosophy Cards
- `bg-primary-secondary dark:bg-primary p-8 rounded-2xl shadow-sm`
- Text: `text-primary-secondary dark:text-primary-foreground`
- Hover: y:-5
- Delay stagger: `index * 0.1`

### Timeline
- Left: year (text-xl, 1/4 width)
- Right: title + description (3/4 width)
- No visual timeline bar — just flex layout
- Delay stagger: `index * 0.1`

---

## 11. Contact Page

### Structure
1. **Hero**: 50vh "Contact" + "Part of your vision"
2. **Contact Info**: 2-column grid (info left, form right)
3. **Social Links**: Instagram, Twitter, Facebook, Youtube, Github
   - Icons in circular buttons: `p-3 bg-primary-secondary rounded-full`
   - Hover: scale-1.1
4. **Contact Form**: Formspree integration inside bordered card
5. **FAQ**: stacked Q&A
6. **Featured Collections**: reused component

### Contact Form
- Inputs: standard rounded `border border-border`, focus ring `ring-primary`
- Submit button: full width `bg-primary` with hover/disabled states
- Formspree validation error display (red box)
- Success state: green success message

---

## 12. Reusable Components

### AnimatedButton
| Prop | Type | Description |
|------|------|-------------|
| href | string | Link destination |
| children | ReactNode | Button text |
| icon? | ReactNode | Optional lucide icon |
| variant? | "primary" \| "secondary" \| "outline" | Style variant |
| className? | string | Extra classes |
| onClick? | () => void | Click handler |

Variants:
- `primary`: `bg-primary text-primary-foreground hover:bg-primary/90`
- `secondary`: `bg-white text-black` / dark: `bg-gray-800 text-white`
- `outline`: `border border-black bg-transparent text-primary`

All: `rounded-full`, `px-6 py-3`

### TagList (used on collection detail)
- Horizontal list of pill tags
- `variant="light"`: white/transparent background for dark hero sections

### TagFilters (showcase page)
- URL-based active state management
- Click to toggle filter on/off
- Animated entrance with staggered children

### Loading
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black" />
```

### ThemeProvider
```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

### UI Button (shadcn/ui style)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Radix `Slot` support for `asChild`

---

## 13. Sound Effects

- **Audio file**: `/public/Fuji Camera Shutter Sound.mp3`
- **Singleton audio element** created once and reused
- **Disabled on mobile** (detected via user agent + window width)
- **Types of play**:
  1. Global click listener: plays on any `<a>` click
  2. `useShutterSound()` hook: manual play for specific components (buttons, theme toggle, collection links)
- Volume: 0.4
- Graceful fallback: if play fails, sounds are disabled

---

## 14. Photo Data Model

```typescript
interface Photo {
  id: string
  src: string
  width: number
  height: number
  alt: string
  metadata: PhotoMetadata
}

interface PhotoMetadata {
  camera: string
  lens: string
  aperture: string
  shutterSpeed: string
  iso: string
  focalLength: string
  takenAt: string
}

interface Collection {
  id: string
  slug: string
  title: string
  description: string
  fullDescription: string
  coverImage: string
  tags: string[]
  featured: boolean
  photos: Photo[]
}
```

**Data storage**: Static data in `lib/collections.ts` with hardcoded collections and auto-generated photo paths.
Photo images stored in `/public/{CollectionName}/` directory.

---

## 15. Dark Mode

- `next-themes` with `attribute="class"` strategy
- Body transition: `transition-colors duration-300`
- All colors defined as HSL variables swapped in `.dark` class
- System preference respected (`enableSystem`, `defaultTheme="system"`)
- Theme color meta tag updated for Safari mobile browsers
- Dark mode smooth transition utility: `.transition-theme`

---

## 16. Key Implementation Patterns

### Scroll Animation Pattern
```tsx
// 1. Create container that tracks scroll progress
<ContainerScroll>   // uses useScroll({ target: ref })
  // 2. Animated grid
  <BentoGrid>
    <BentoCell>{/* images that translate+scale on scroll */}</BentoCell>
  </BentoGrid>
  // 3. Content that fades on scroll
  <ContainerScale>
    {/* overlay title/content that fades+scales out */}
  </ContainerScale>
</ContainerScroll>
```

### Entry Animation Pattern (most sections)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
/>
```

### Photo Gallery Card Pattern
```tsx
<div className="relative overflow-hidden bg-black rounded-lg shadow-md">
  <div className="relative h-80 w-full overflow-hidden">
    <Image fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90" />
  </div>
  <div className="absolute bottom-0 left-0 right-0 p-6">
    <h3 className="text-2xl text-white">{title}</h3>
    <p className="text-white/80">{description}</p>
  </div>
</div>
```

### URL Filter Pattern (tag-based)
```tsx
const params = new URLSearchParams(searchParams.toString())
if (currentTag === tag) params.delete("tag")
else params.set("tag", tag)
router.push(`/showcase?${params.toString()}`)
```

### Utility Function
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Responsive Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- Custom `max-w-8xl` is NOT defined (falls to default max-widths)

### File Organization
```
app/
  layout.tsx           // root layout (ThemeProvider, Header, Footer, SoundEffects)
  page.tsx             // home page
  globals.css          // tailwind + theme variables + global styles
  about/page.tsx
  contact/page.tsx
  showcase/page.tsx
  collections/[slug]/page.tsx
  collections/[slug]/collection-content.tsx
components/
  header.tsx
  footer.tsx
  animated-button.tsx
  theme-toggle.tsx
  theme-provider.tsx
  hero-gallery-scroll.tsx
  hero-gallery-scroll-animation.tsx
  collection-grid.tsx
  featured-collections.tsx
  layout-image-grid.tsx
  photo-gallery.tsx
  tag-filters.tsx
  tag-list.tsx
  contact-form.tsx
  loading.tsx
  sound-effects.tsx
  logo.tsx
  safari-theme-color.tsx
  ui/
    button.tsx
    calendar.tsx
    sonner.tsx
    navigation-menu.tsx
    layout-grid.tsx
lib/
  types.ts
  utils.ts
  collections.ts
public/
  fonts/
    Old London Font.woff
  {CollectionName}/
    cover.{ext}
    {collection-slug}-{n}.{ext}
  Fuji Camera Shutter Sound.mp3
```
