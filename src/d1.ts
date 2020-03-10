// import { Console } from "as-wasi"; // not compatible with tests
import { Checkout, Discount, Discounts } from "./discount";
import { Slice, InternalTypes, Money } from "@shopify/scripts-sdk";

class Threshold {
  spend: InternalTypes.Int;    // spend amount (in cents)
  discount: InternalTypes.Int; // percentage discount
}

// Define spending thresholds, from lowest spend to highest spend.
const SPENDING_THRESHOLDS: Array<Threshold> = [
  {
    spend: 3000,   // spend amount (in cents)
    discount: 10   // percentage discount
  },
  {
    spend: 5000,
    discount: 15
  },
  {
    spend: 10000,
    discount: 20
  }
];

function find_eligible_threshold(thresholds: Array<Threshold>, spend: InternalTypes.Int): Threshold {
  let id = -1;
  for (let i = 0; i < thresholds.length; i++) {
    if (spend >= thresholds[i].spend) {
      id = i;
    }
  }

  if (id == -1) { return { spend: 0, discount: 0 } }
  return thresholds[id];
}

export function run(input: Checkout): Discounts {
  let sum = 0;
  for (let i = 0; i < input.lineItems.length; i++) {
    // There is a lossy conversion here, as toSubunits() returns i64.
    // We can adapt to change sum to be i64, but it leaks i64 in the
    // signature of find_eligible_threshold_id
    sum += <InternalTypes.Int>input.lineItems[i].price.toSubunits();
  }

  const threshold =find_eligible_threshold(SPENDING_THRESHOLDS, sum);

  let discountArray: Array<Discount> = [];
  for (let i = 0; i < input.lineItems.length; i++) {
    discountArray.push(input.lineItems[i].discountPercent(100 - threshold.discount, "Extension Discount"));
  }
  return Discounts.from(discountArray);
}
