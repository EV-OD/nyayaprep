# Project Documentation: NyayaPrep

This document serves as a comprehensive guide to the project's theming, styling patterns, and component conventions. It can also be used to guide AI or new team members on how to work with the codebase.

---

## 1. Overview

NyayaPrep is a modern web application that leverages:
- **React / Next.js** for UI rendering.
- **Tailwind CSS** for utility-first styling.
- **ShadCN UI patterns** and custom components to maintain consistent design.

---

## 2. Theme

### a. Color Scheme & Typography
- **Primary Colors:**  
  - Primary text: `text-primary`
  - Muted text: `text-muted-foreground`
  - Background: uses classes such as `bg-muted/30` and `bg-background`
- **Typography:**  
  - Headings use larger font-sizes like `text-2xl`.
  - Regular body text uses default utility classes provided by Tailwind.

### b. Configuration
- **Tailwind Config:**  
  The project uses a Tailwind CSS config (defined in `tailwind.config.ts` as referenced in [components.json](./components.json)) with overrides for:
  - Custom themes and variants.
  - Aliases for component imports:
    - `@/components`
    - `@/components/ui`
    - `@/components/layout`
    - `@/lib` and `@/hooks`
- **Dynamic Theme Adjustments:**  
  AI or components may utilize dynamic theming—for example, using inline styles or CSS variables created via components like `ChartStyle` ([src/components/ui/chart.tsx](./src/components/ui/chart.tsx)).
  
---

## 3. Styling Patterns

### a. Utility-First Approach
- Tailwind CSS is the primary styling method.
- Use utility classes directly in JSX for layout, spacing, colors, etc.
- Patterns such as `flex`, `p-6`, `min-h-screen`, and responsive utilities ensure consistency.

### b. Component-Based Styling
- **UI Components:**  
  Custom components (e.g., `Card`, `CardContent`, `CardHeader`, `CardTitle`) encapsulate styling and design.
- **Inline Styles & Dynamic Theming:**  
  Some components generate styles dynamically (refer to `ChartStyle` in [src/components/ui/chart.tsx](./src/components/ui/chart.tsx)).
- **Global Styles:**  
  Global styles are set in `src/app/globals.css` as part of the tailwind and shadcn standard.

### c. CSS-in-JS Conventions
- Some areas (as seen in the `.next` output files) indicate usage of CSS-in-JS techniques:
  - Dynamic insertion of style tags.
  - Use of mechanisms to ensure style deduplication and dynamic selector generation (e.g. using `computeSelector`, `computeId`).

---

## 4. Component Documentation

### a. PublicNavbar
- **Location:** `@/components/layout/public-navbar`
- **Usage:** Appears across public-facing pages for navigation.

### b. Card and Related UI Components
- **Location:** `@/components/ui/card`
- **Components:**  
  - `Card`: Wrapper for content.
  - `CardHeader`: Provides header styling.
  - `CardTitle`: Displays a title with consistent typography.
  - `CardContent`: Contains the main content.
- **Example:**  
  The [Privacy Page](./src/app/privacy/page.tsx) uses a card layout to display legal information.

### c. Dynamic Theming Components
- **ChartStyle:**  
  - **Location:** [src/components/ui/chart.tsx](./src/components/ui/chart.tsx)
  - **Function:** Generates and injects theme-specific CSS variables based on configuration.
  
---

## 5. Documentation and Future AI Guidance

- This document is intended to guide AI integrations and onboarding by detailing:
  - The **typography, color schemes**, and **layout patterns**.
  - How **utility classes** and **component-based styling** are used together.
  - The **dynamic theming** implementation achieved via both Tailwind and CSS-in-JS patterns.
- **Future guidelines:**  
  - Always refer to the Tailwind configuration in [components.json](./components.json) for theming variables.
  - Utilize existing UI components for consistency.
  - When updating components or styles, update this guide accordingly.
  
---

## 6. Additional References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ShadCN UI Patterns](https://ui.shadcn.com/docs)  
- [Next.js Documentation](https://nextjs.org/docs)

---
