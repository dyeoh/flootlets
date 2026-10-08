// Placeholder "product photos" for the docs, as inline SVGs (no image files).
export function placeholder(label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="hsl(${hue} 45% 82%)"/><circle cx="200" cy="170" r="90" fill="hsl(${hue} 50% 62%)"/><text x="200" y="330" font-family="system-ui,sans-serif" font-size="30" text-anchor="middle" fill="hsl(${hue} 40% 25%)">${label}</text></svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  return { thumb: url, large: url };
}

export const products = [
  { name: 'Kuih Lapis', slug: 'kuih-lapis', price: 1290, compareAt: 1590, inStock: true, hue: 20 },
  {
    name: 'Tudung Bawal Satin',
    slug: 'tudung',
    price: 3500,
    compareAt: null,
    inStock: true,
    hue: 330,
  },
  {
    name: 'Baju Kurung Moden',
    slug: 'baju-kurung',
    price: 12900,
    compareAt: null,
    inStock: false,
    hue: 210,
  },
  { name: 'Kerepek Pisang', slug: 'kerepek', price: 850, compareAt: null, inStock: true, hue: 45 },
  { name: 'Dodol Durian', slug: 'dodol', price: 1800, compareAt: 2200, inStock: true, hue: 90 },
  {
    name: 'Songket Shawl',
    slug: 'songket',
    price: 25900,
    compareAt: null,
    inStock: true,
    hue: 280,
  },
];
