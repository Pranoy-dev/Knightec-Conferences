# Knightec Logo Replacement Guide

## Current Implementation

The app currently uses a placeholder logo component (`KnightecLogo.tsx`) that displays a stylized "K" with geometric accents matching Knightec's tech aesthetic.

## How to Replace with Actual Logo

### Option 1: Using SVG File (Recommended)

1. Place your Knightec logo SVG file in `/public/knightec-logo.svg`

2. Update `components/KnightecLogo.tsx`:

```tsx
import Image from "next/image";

export function KnightecLogo({ className }: KnightecLogoProps) {
  return (
    <Image
      src="/knightec-logo.svg"
      alt="Knightec Logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
```

### Option 2: Using Inline SVG

1. Copy the SVG code from your Knightec logo file
2. Replace the content in `components/KnightecLogo.tsx` with the actual SVG code
3. Make sure to preserve the `className` prop for styling

### Option 3: Using PNG/JPG

1. Place your logo file in `/public/knightec-logo.png` (or `.jpg`)
2. Update `components/KnightecLogo.tsx`:

```tsx
import Image from "next/image";

export function KnightecLogo({ className }: KnightecLogoProps) {
  return (
    <Image
      src="/knightec-logo.png"
      alt="Knightec Logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
```

## Logo Specifications

The header is designed to accommodate logos with:
- **Recommended size**: 32x32px (display size)
- **Aspect ratio**: Square or near-square works best
- **Color**: The logo will inherit the primary color (`text-primary`) by default
- **Format**: SVG preferred for scalability, PNG/JPG also supported

## Styling

The logo automatically:
- Uses the primary color (tech blue) from the design system
- Scales on hover (105% scale)
- Maintains proper spacing in the header
- Is accessible with proper alt text

If you need custom styling, you can modify the `className` prop in `components/Header.tsx`.

## Notes

- The logo is currently set to `h-8 w-8` (32px) in the header
- It's clickable and links to the home page
- The component is fully responsive and works in both light and dark modes
