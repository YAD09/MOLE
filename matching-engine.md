# Matching Engine Logic (Hackathon Feasible)

## 1. Matching Parameters

The core algorithm relies on a deterministic, weighted scoring system based on five primary axes.

*   **Waste Type (Category & Sub-Category):** Exact or near-exact matches based on a pre-defined taxonomy (e.g., Category: Metals -> Sub-Category: Aluminum Slag).
*   **Quantity (Volume/Weight):** Does the supply meet the buyer's minimum threshold without drastically exceeding their maximum capacity?
*   **Proximity (Distance in KM/Miles):** Calculated using Haversine formula (straight-line distance). Freight costs kill circular economics; materials must be local.
*   **Frequency (Spot vs. Continuous):** Is this a one-time cleanout (Spot) or a recurring monthly output (Continuous)?
*   **Compatibility Factors (Purity/Contamination):** Binary pass/fail based on maximum allowable contamination for the buyer's process (e.g., Buyer needs < 5% moisture).

---

## 2. Compatibility Scoring Model (100 Point Scale)

Each parameter is assigned a maximum weight. The total score determines the "Match Percentage."

*   **Waste Type / Taxonomy (40 pts):**
    *   Exact Match (Sub-Category) = 40 pts
    *   Broad Match (Category only, requires manual review) = 20 pts
    *   Mismatch = 0 pts (Immediate filter out)
*   **Proximity (20 pts):**
    *   < 50 miles = 20 pts
    *   50 - 150 miles = 15 pts
    *   150 - 300 miles = 5 pts
    *   > 300 miles = 0 pts
*   **Quantity Alignment (20 pts):**
    *   Supply is directly within Buyer's requested range = 20 pts
    *   Supply is > Buyer's max (requires splitting/partial load) = 10 pts
    *   Supply is < Buyer's min (not worth the freight) = 0 pts
*   **Frequency Match (10 pts):**
    *   Buyer wants Recurring, Supply is Recurring = 10 pts
    *   Buyer wants Spot, Supply is Spot = 10 pts
    *   Mismatch (Buyer wants Spot, Supply is Recurring) = 5 pts
*   **Purity/Compatibility (10 pts):**
    *   Meets or exceeds purity standard = 10 pts
    *   Falls slightly below (might be negotiated at lower price) = 5 pts

*Match Thresholds:*
*   **> 85%:** "High Match" (Push Notification to both parties)
*   **60% - 84%:** "Potential Match" (Appears in marketplace Dashboard)
*   **< 60%:** Filtered out (Not recommended)

---

## 3. Example Matching Rules

**Scenario:** A Furniture Factory produces wood pallets. A Biomass Energy Plant needs wood material to burn for fuel.

*   **Supply Listing (Factory):** Waste Type: Untreated Wood Pallets. Quantity: 10 Tons. Proximity: Origin is Zip Code A. Frequency: Monthly. Contamination: 0% chemicals.
*   **Demand Listing (Biomass Plant):** Waste Type: Any Untreated Wood. Min Quantity: 5 Tons. Proximity: Max 100 miles from Zip Code B (Actual distance is 40 miles). Frequency: Monthly. Contamination threshold: < 2% chemicals.

*Calculation:*
1.  Type: Exact Match (Untreated Wood) -> +40
2.  Proximity: 40 Miles (< 50) -> +20
3.  Quantity: 10T is > Min 5T -> +20
4.  Frequency: Both Monthly -> +10
5.  Compatibility: 0% chemicals is < 2% limit -> +10
*   **Total Score:** 100 / 100 (Perfect Match)

---

## 4. Simplified Algorithm Logic (Hackathon Implementation)

For a fast, reliable hackathon prototype, avoid ML. Use simple SQL queries or array filtering with a scoring function in JavaScript/TypeScript.

```javascript
// Pseudo-code for matching logic

function calculateMatchScore(supply, demand) {
  let score = 0;

  // 1. Hard Filter: Waste Type
  if (supply.categoryId !== demand.categoryId) {
    return 0; // Immediate rejection
  } else if (supply.subCategoryId === demand.subCategoryId) {
    score += 40; // Exact match
  } else {
    score += 20; // Category match, different sub-category
  }

  // 2. Proximity (Assuming distance is pre-calculated via Haversine)
  const distanceMiles = calculateDistance(supply.location, demand.location);
  if (distanceMiles <= 50) score += 20;
  else if (distanceMiles <= 150) score += 15;
  else if (distanceMiles <= 300) score += 5;

  // 3. Quantity
  if (supply.quantity >= demand.minQuantity && supply.quantity <= demand.maxQuantity) {
    score += 20;
  } else if (supply.quantity > demand.maxQuantity) {
    score += 10; // Can sell a partial amount
  }

  // 4. Frequency
  if (supply.frequency === demand.frequency) score += 10;
  else score += 5;

  // 5. Purity
  if (supply.purityLevel >= demand.minPurityRequired) score += 10;
  else score += 5;

  return score;
}

// How to use it:
const matches = allDemands
  .map(demand => ({
    demand,
    score: calculateMatchScore(newSupplyListing, demand)
  }))
  .filter(match => match.score >= 60) // Only keep > 60%
  .sort((a, b) => b.score - a.score); // Highest score first
```
