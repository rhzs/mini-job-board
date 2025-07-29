import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create a consistent slug from a company name
export function createCompanySlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'unknown-company'
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    || 'unknown-company' // Fallback if result is empty
}

// Create a scalable company link that uses ID when available
export function createCompanyLink(companyId: string | undefined | null, companyName: string): string {
  const slug = createCompanySlug(companyName)
  
  // If we have a company ID, use ID-based format for uniqueness and performance
  if (companyId && companyId.trim() && companyId !== 'undefined' && companyId !== 'null') {
    return `${companyId}-${slug}`
  }
  
  // Fallback to slug-only for backward compatibility (legacy data)
  // Add a prefix to distinguish from ID-based URLs
  return `company-${slug}`
}

// Extract company ID from URL slug parameter
export function extractCompanyId(slugParam: string): { id: string | null, slug: string } {
  if (!slugParam) {
    return { id: null, slug: 'unknown-company' }
  }
  
  // Check if the slug contains an ID (format: "uuid-company-name")
  // UUID pattern: 8-4-4-4-12 characters (like: 12345678-1234-1234-1234-123456789012)
  const uuidMatch = slugParam.match(/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})-(.+)$/)
  
  if (uuidMatch && uuidMatch[1] && uuidMatch[2]) {
    // First part is a UUID, second part is the slug
    return { id: uuidMatch[1], slug: uuidMatch[2] }
  }
  
  // Check for simple numeric ID (format: "123-company-name")
  const numericMatch = slugParam.match(/^(\d+)-(.+)$/)
  
  if (numericMatch && numericMatch[1] && numericMatch[2]) {
    // First part is a number, second part is the slug
    return { id: numericMatch[1], slug: numericMatch[2] }
  }
  
  // Check for company-prefix format (format: "company-name-slug")
  const companyPrefixMatch = slugParam.match(/^company-(.+)$/)
  
  if (companyPrefixMatch && companyPrefixMatch[1]) {
    // Company prefix format, extract the slug part
    return { id: null, slug: companyPrefixMatch[1] }
  }
  
  // No ID found, treat entire string as slug (legacy format)
  return { id: null, slug: slugParam }
}

// Convert a slug back to a searchable name pattern
export function slugToSearchPattern(slug: string): string {
  return slug
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .trim()
} 