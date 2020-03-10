import { Slice, InternalTypes, Money } from '@shopify/scripts-sdk';

/**
 * A collection of `Discount`.
 * Use the static method `from` to build an instance your script would return
 */
@unmanaged
export class Discounts extends Slice<Discount> {
  static fromArray(arr: Array<Discount>): Discounts {
    return <Discounts>Slice.from<Discount>(arr);
  }

  /**
   * Factory method to build a `Discounts` instance from an array of `Discount`
   * @param arr
   */
  @inline
  static from(arr: Array<Discount>): Discounts {
    return Discounts.fromArray(arr);
  }
}

/**
 * `Discount` represent a discount on a `LineItem`. These are instantiated though the `LineItem` API these relate to
 * You shouldn't have to `new` any directly within your scripts
 */
@unmanaged
export class Discount {
  private _lineItemId: InternalTypes.Str;
  private _value: InternalTypes.Int;
  private _title: InternalTypes.Str;

  @operator("==")
  private __eq(other: Discount): bool {
    return this._lineItemId == other._lineItemId &&
      this._value == other._value &&
      this._title == other._title;
  }

  /**
   * todo: I don't think this should be part of the API
   */
  get lineItemId(): String {
    return this._lineItemId.toString();
  }

  /**
   * The title of the discount, so the buyer knows what this refers to
   *
   * @returns The title of the discount
   */
  get title(): String {
    return this._title.toString();
  }

  /**
   * The value of the discount, in subunits
   *
   * @returns the discounted amount of the `LineItem` in subunits in that `LineItems` currency
   */
  get value(): i32 {
    return this._value;
  }
}

/**
 * Represents a simplistic view on a buyer's checkout.
 *
 * It contains all the items and their quantity that are being purchased, as well as any previous `Discount`s that may
 * have been associated with this checkout.
 *
 */
@unmanaged
export class Checkout {
  private readonly _lineItems: Slice<LineItem>;
  private readonly _discountCodes: Slice<DiscountCode>;

  /**
   * The line items for this `Checkout`. There will always be at least one item being purchased.
   *
   * @returns An Array of `LineItem` instances.
   */
  get lineItems(): Array<LineItem> {
    return this._lineItems.extend_array([]);
  }

  /**
   * The previously discount codes that may have been applied on the `Checkout`
   * This will always be an empty list right now.
   *
   * @returns An Array of `DiscountCode` instances.
   */
  get discountCodes(): Array<DiscountCode> {
    return this._discountCodes.extend_array([]);
  }
}

/**
 * A `LineItem` represents an `Variant` being purchase in a certain `#quantity` by a buyer. It also
 * contains meta data about the line itself, like its label.
 */
@unmanaged
export class LineItem {
  private readonly _id: InternalTypes.Str;

  /**
   * The `Variant` for this line.
   *
   * @returns `Variant` of the item being purchased
   */
  public readonly variant: Variant;

  /**
   * The amount requested by the buyer
   *
   * @returns The quantity being purchased
   */
  public readonly quantity: InternalTypes.Int;
  private readonly _title: InternalTypes.Str;

  /**
   * todo: A value... of something. I _think_ it _should_ be the qty * variant.price - sum(discounts)... but right now
   * it is not. It's a `Money#value` (instead of `Money#subunits`) representation. This needs to be addressed here
   * in docs, then on the Core side!
   */
  public readonly price: Money;

  /**
   * Applies a fixed Discount on the line.
   *
   * @param amount
   * @param title
   */
  discount(amount: InternalTypes.Int, title: String): Discount {
    return {_lineItemId: this._id, _value: amount, _title: InternalTypes.Str.from(title)}
  }

  /**
   * todo: I think this is broken. This uses `#price` which might make sense, but unsure.
   * Again I thin we need to define the clear semantics of that price field.
   *
   * @param percentage
   * @param title
   */
  discountPercent(percentage: InternalTypes.Float, title: String): Discount {
    return {
      _lineItemId: this._id,
      _value: <InternalTypes.Int>(Math.floor(<InternalTypes.Float>this.price.toSubunits() * (percentage / 100.0))),
      _title: InternalTypes.Str.from(title)
    };
  }

  /**
   * See `#discountPercent`, I don't really know given the existing what this contract is supposed to be.
   *
   * @param percentage
   * @param maxLineItems
   * @param title
   */
  discountPercentWithMax(percentage: InternalTypes.Float, maxLineItems: InternalTypes.Int, title: String): Discount {
    let per_unit_price = <InternalTypes.Float>this.price.toSubunits() / <InternalTypes.Float>this.quantity;
    let discountable_price = Math.min(maxLineItems, this.quantity) * per_unit_price;
    let discount_amount = <InternalTypes.Int>(Math.floor(discountable_price * (percentage / 100.0)));
    return {_lineItemId: this._id, value: discount_amount, _title: InternalTypes.Str.from(title)};
  }

  /**
   * TODO: I think we might want to _not_ expose this to the script developer, it might be used to match back, but we
   * probably want to encapsulate that and hide it from the script authors.
   */
  get id(): String {
    return this._id.toString();
  }

  /**
   * The title of the line, will generally relate to the `Variant`'s `Product`
   *
   * @returns The human readable title for this `LineItem`
   */
  get title(): String {
    return this._title.toString();
  }
}

/**
 * A `Variant` represents a different version of a `Product`, such as differing sizes or differing colors.
 */
@unmanaged
export class Variant {
  /**
   * A Globally unique identifier.
   *
   * @returns the unique identifier for this `Variant`
   */
  public readonly id: InternalTypes.ID;

  /**
   * The `Product` this `Variant` is of
   *
   * @returns the instance of `Product` this belongs to
   */
  public readonly product: Product;

  /**
   * The unit price for this `Variant`
   *
   * @returns the unit price
   */
  public readonly price: Money;
}

@unmanaged
export class Product {

  /**
   * A Globally unique identifier.
   *
   * @returns the unique identifier for this `Product`
   */
  public readonly id: InternalTypes.ID;
  private readonly _title: InternalTypes.Str;
  private readonly _tags: Slice<InternalTypes.Str>;

  /**
   * todo: how's i18n working here?
   *
   * @returns the title of the `Product`
   */
  get title(): String {
    return this._title.toString();
  }

  /**
   * A categorization that a product can be tagged with, commonly used for filtering and searching.
   *
   * @returns the tags associated with this `Product`
   */
  get tags(): String[] {
    return this._tags.map<String>(str => str.toString());
  }
}

/**
 * The form of this is tbd
 * You will never get an instance of these right now... Work In Progress!
 */
@unmanaged
export class DiscountCode {
  private readonly _code: InternalTypes.Str;
  private readonly _type: InternalTypes.Str;
  public readonly amount: Money | null;
  public readonly percentage: InternalTypes.Int;

  get code(): String {
    return this._code.toString();
  }

  get type(): String {
    return this._type.toString();
  }
}
