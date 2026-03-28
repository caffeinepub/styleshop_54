# ZEEEP Order ID Display

## Current State
Orders are stored in the backend with sequential Nat IDs (1, 2, 3...). These are displayed to customers as `#1`, `#2`, etc.

## Requested Changes (Diff)

### Add
- A frontend helper function `formatOrderId(id: number): string` that encodes a numeric order ID into a 5-char alphanumeric code (e.g. `ZP4K2`). The encoding should be deterministic but non-obvious (not sequential-looking). Use multiply-by-prime + base-32 encoding with an unambiguous charset (no O, 0, I, 1).
- Wherever an order ID is displayed to the user, use this formatted ID.

### Modify
- All places in the frontend that display order IDs: order confirmation page, /track-order page, /account page, admin orders table -- all should show the formatted 5-char code instead of raw `#N`.
- The /track-order page currently accepts a numeric order ID input. Change the input to accept the 5-char formatted code. Add a `decodeOrderId(code: string): number | null` reverse function that tries all IDs (1 to some max like 10000) to find a match.

### Remove
- Raw `#1`, `#2` style display of order IDs anywhere in the customer-facing UI.

## Implementation Plan
1. Create utility file `src/frontend/src/utils/orderId.ts` with `formatOrderId` and `decodeOrderId` functions.
2. Update all components that display or accept order IDs to use the new formatted codes.
