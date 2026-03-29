# ZEEEP - Product Subcategory Categorization

## Current State
Products in the backend only have a `category` field with values `"Men"` or `"Accessories"`. The frontend color swatch logic (`getColorsForCategory`) checks the category string for keywords like "shirt", "jeans", "pant", but since no product has those values, zero color swatches are ever shown.

## Requested Changes (Diff)

### Add
- `subcategory: Text` field to the `Product` type in the backend
- Proper subcategory values for all 30 seeded products (T-Shirt, Shirt, Jeans, Pants, Jacket, Hoodie, Sweater, Shorts, Footwear, Accessories, etc.)
- Subcategory editing field in the admin product editor

### Modify
- `updateProduct` backend function to persist subcategory
- `backend.d.ts` to include `subcategory` in Product type
- `getColorsForCategory` utility to accept and check `subcategory` instead of `category`
- `ProductCard` and `ProductModal` to pass `product.subcategory` for color detection
- Admin page product form to include subcategory input

### Remove
- Nothing removed

## Implementation Plan
1. Update `Product` type in `main.mo` to add `subcategory: Text`
2. Update `updateProduct` to persist the new field
3. Assign correct subcategories to all 30 seed products
4. Update `backend.d.ts` with the new field
5. Update `productColors.ts` to use subcategory
6. Update `ProductCard` and `ProductModal` to use subcategory
7. Update admin product edit form to include subcategory
