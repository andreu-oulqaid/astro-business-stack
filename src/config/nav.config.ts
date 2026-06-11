/**
 * Navigation Configuration
 *
 * Defines which pages appear in the site navigation and their display order.
 * Astro handles routing via the filesystem — this only controls nav menus.
 */

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

export const navItems: NavItem[] = [
  { label: 'Features', href: '/#tech-edge', order: 1 },
  { label: 'Deployments', href: '/#deployments', order: 2 },
  { label: 'About', href: '/about', order: 3 },
  { label: 'Contact', href: '/contact', order: 4 },
];

export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}
