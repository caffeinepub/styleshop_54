// Common color options for clothing categories

export interface ColorOption {
  name: string;
  hex: string;
}

const TSHIRT_COLORS: ColorOption[] = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Smokey Grey", hex: "#6b6b6b" },
  { name: "Red", hex: "#c0392b" },
  { name: "Olive", hex: "#6b7c3b" },
  { name: "Beige", hex: "#d4b896" },
  { name: "Brown", hex: "#7b5230" },
];

const SHIRT_COLORS: ColorOption[] = [
  { name: "White", hex: "#f5f5f5" },
  { name: "Sky Blue", hex: "#5b9bd5" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Grey", hex: "#9e9e9e" },
  { name: "Beige", hex: "#d4b896" },
  { name: "Brown", hex: "#7b5230" },
  { name: "Olive Green", hex: "#556b2f" },
  { name: "Onion Pink", hex: "#e8a0a0" },
];

const JEANS_COLORS: ColorOption[] = [
  { name: "Indigo", hex: "#3b4f8c" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Grey", hex: "#9e9e9e" },
  { name: "Light Blue", hex: "#89b4d4" },
];

const PANTS_COLORS: ColorOption[] = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Grey", hex: "#9e9e9e" },
  { name: "Khaki", hex: "#c2b280" },
  { name: "Brown", hex: "#7b5230" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Beige", hex: "#d4b896" },
];

export function getColorsForCategory(category: string): ColorOption[] {
  const cat = category.toLowerCase();
  if (
    cat.includes("t-shirt") ||
    cat.includes("tshirt") ||
    cat.includes("t shirt")
  ) {
    return TSHIRT_COLORS;
  }
  if (cat.includes("shirt")) {
    return SHIRT_COLORS;
  }
  if (cat.includes("jean") || cat.includes("denim")) {
    return JEANS_COLORS;
  }
  if (
    cat.includes("pant") ||
    cat.includes("trouser") ||
    cat.includes("chino") ||
    cat.includes("jogger")
  ) {
    return PANTS_COLORS;
  }
  // For accessories or unknown categories, return empty (no color swatches)
  return [];
}
