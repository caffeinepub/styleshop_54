export interface ColorOption {
  name: string;
  hex: string;
}

const COLOR_MAP: Record<string, string> = {
  Black: "#1a1a1a",
  White: "#f8f8f8",
  Navy: "#1e3a5f",
  "Smokey Grey": "#7a7a7a",
  Grey: "#7a7a7a",
  Red: "#c0392b",
  Olive: "#6b7c37",
  Beige: "#f0dfc0",
  Brown: "#7d4f2f",
  "Sky Blue": "#87ceeb",
  "Olive Green": "#6b7c37",
  "Onion Pink": "#f4a8b4",
  Indigo: "#3f3d8c",
  "Light Blue": "#add8e6",
  Khaki: "#c3b091",
  Maroon: "#800020",
  Charcoal: "#36454f",
  Camel: "#c19a6b",
  "Dark Grey": "#555555",
};

const SUBCATEGORY_COLORS: Record<string, string[]> = {
  "T-Shirt": [
    "Black",
    "White",
    "Navy",
    "Smokey Grey",
    "Red",
    "Olive",
    "Beige",
    "Brown",
  ],
  Tshirt: [
    "Black",
    "White",
    "Navy",
    "Smokey Grey",
    "Red",
    "Olive",
    "Beige",
    "Brown",
  ],
  "T-shirt": [
    "Black",
    "White",
    "Navy",
    "Smokey Grey",
    "Red",
    "Olive",
    "Beige",
    "Brown",
  ],
  Shirt: [
    "White",
    "Sky Blue",
    "Black",
    "Navy",
    "Smokey Grey",
    "Beige",
    "Brown",
    "Olive Green",
    "Onion Pink",
  ],
  Jeans: ["Indigo", "Black", "Smokey Grey", "Light Blue"],
  Pants: ["Black", "Navy", "Smokey Grey", "Khaki", "Brown", "White", "Beige"],
  Chinos: ["Khaki", "Beige", "Navy", "Olive", "White", "Black", "Brown"],
  Hoodies: [
    "Black",
    "White",
    "Navy",
    "Smokey Grey",
    "Olive",
    "Maroon",
    "Brown",
  ],
  Hoodie: ["Black", "White", "Navy", "Smokey Grey", "Olive", "Maroon", "Brown"],
  Blazer: ["Black", "Navy", "Charcoal", "Smokey Grey", "Camel", "Brown"],
};

export function getColorsForSubcategory(subcategory: string): ColorOption[] {
  // Try exact match first, then case-insensitive
  const key =
    Object.keys(SUBCATEGORY_COLORS).find(
      (k) => k.toLowerCase() === subcategory.toLowerCase(),
    ) ?? "";
  const names = key ? SUBCATEGORY_COLORS[key] : [];
  return names.map((name) => ({ name, hex: COLOR_MAP[name] ?? "#999" }));
}

export function hexForColor(name: string): string {
  return COLOR_MAP[name] ?? "#999";
}
