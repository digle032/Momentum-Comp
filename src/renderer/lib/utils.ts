import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns a ui-avatars.com URL using the current theme's avatar colors from CSS variables. */
export function getAvatarUrl(name: string, size?: number): string {
  const style = getComputedStyle(document.documentElement)
  const bg = style.getPropertyValue('--avatar-bg').trim() || '1e2a3a'
  const fg = style.getPropertyValue('--avatar-fg').trim() || '00f5d4'
  const sizeParam = size ? `&size=${size}` : ''
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${fg}${sizeParam}`
}
