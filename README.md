# Indeed Landing Page Clone

A pixel-perfect clone of the Indeed job search website landing page built with modern web technologies.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS v3.4.0, shadcn/ui components
- **Backend**: Supabase (ready for integration)
- **DI Container**: Inversify
- **Icons**: Lucide React

## Features

- ✅ Responsive design matching Indeed's layout
- ✅ Modern component architecture
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Component-based architecture with reusable UI components
- ✅ Ready for Supabase integration

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
jobboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── header.tsx        # Header with navigation and search
│   ├── hero-section.tsx  # Hero section with illustration
│   └── footer.tsx        # Footer with links
├── lib/                  # Utility functions
│   ├── utils.ts          # Helper functions
│   └── supabase.ts       # Supabase client (ready for use)
└── ...
```

## Components

### Header
- Indeed logo and branding
- Navigation menu (Home, Company reviews, Salary guide)
- Search functionality with job title and location inputs
- Sign in and Employers/Post buttons

### Hero Section
- Illustrated diverse people graphic (CSS-based)
- Welcome message
- Call-to-action button

### Footer
- Links to resume posting
- International site links
- Language selector
- Trending topics dropdown

## Supabase Integration

To connect with Supabase:

1. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. The Supabase client is already configured in `lib/supabase.ts`

## Styling

This project uses Tailwind CSS with custom Indeed branding colors:
- `indeed-blue`: #2d5aa0
- `indeed-blue-dark`: #164081
- `indeed-blue-light`: #4a90e2

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This is a demo project for educational purposes. 