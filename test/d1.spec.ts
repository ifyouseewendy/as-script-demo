import * as discount from "../src/discount";
// It seems awkward that Str doesn't live the same level as Slice
import { Slice, InternalTypes, Money } from "@shopify/scripts-sdk";
import { run } from "../src/d1";

// == TEST INPUT
// it's a pain to construct test data
const CHECKOUT: discount.Checkout = {
  _lineItems: Slice.from<discount.LineItem>(LINE_ITEMS),
  _discountCodes: Slice.from<discount.DiscountCode>([]),
}

const LINE_ITEMS: Array<discount.LineItem> = [
  {
    _id: InternalTypes.Str.from("1"),
    variant: VARIANTS[0],
    quantity: 10,
    _title: InternalTypes.Str.from("line item 2"),
    price: Money.fromSubunits(1000, "CAD")
  },
  {
    _id: InternalTypes.Str.from("2"),
    variant: VARIANTS[1],
    quantity: 20,
    _title: InternalTypes.Str.from("line item 2"),
    price: Money.fromSubunits(3000, "CAD")
  },
];

const VARIANTS: Array<discount.Variant> = [
  {
    id: 1,
    product: PRODUCT,
    price: Money.fromSubunits(100, "CAD")
  },
  {
    id: 2,
    product: PRODUCT,
    price: Money.fromSubunits(200, "CAD")
  },
];

const PRODUCT: discount.Product = {
  id: 1,
  _title: InternalTypes.Str.from("product 1"),
  _tags: Slice.from<InternalTypes.Str>([InternalTypes.Str.from("product tag a"), InternalTypes.Str.from("product tag b")])
};

describe("run", () => {
  it("should return the same amount of discounts as line items", () => {
    const discounts = run(CHECKOUT);
    expect<i32>(discounts.length).toBe(CHECKOUT.lineItems.length, "Discounts size doesn't match line items");
  });

  it("should apply the 10 percent discount based on the total spend 4000", () => {
    const discounts = run(CHECKOUT);
    expect<i32>((<discount.Discount>discounts[0]).value).toBe(900, "Discount value is incorrect");
    expect<i32>((<discount.Discount>discounts[1]).value).toBe(2700, "Discount value is incorrect");
  });
});

