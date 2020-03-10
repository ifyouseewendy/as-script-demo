import { InternalTypes } from "./internal-types";

/**
 * A `Money` represents an amount of money in a given currency.
 * The currency is represented using [ISO 4217 codes](https://www.iso.org/iso-4217-currency-codes.html),
 * while the subunits represent the actual amount in the minor unit (the "exponent") for that currency.
 *
 */
@unmanaged
export class Money {
  private readonly _subunits: InternalTypes.i64_t;
  private readonly _currency: InternalTypes.Str;

  /**
   * Constructs a new `Money` instance.
   *
   * ```
   * Money.fromSubunits(100, "CAD"); // instantiate C$1
   * ```
   *
   * @param subunits the actual amounts this represents in the currency's minor unit
   * @param currency the ISO 4217 code of the currency used
   */
  static fromSubunits(subunits: i64, currency: String): Money {
    return new Money(subunits, currency);
  }

  private constructor(subunits: i64, currency: String) {
    this._subunits = new InternalTypes.i64_t(subunits);
    this._currency = InternalTypes.Str.from(currency);
  }

  /**
   * Three letter code of the currency code
   *
   * @returns The ISO 4217 code of the currency
   */
  get currency(): String {
    return this._currency.toString();
  }

  /**
   * The precision of the returned value depends on the currency's minor unit
   *
   * ```
   * one_USD.toSubunits() == 100;
   * one_JPY.toSubunits() == 1;
   * one_CLF.toSubunits() == 10_000;
   *
   * ```
   *
   * *Warning:* The returned value could be lossy, in case the value doesn't fit in a signed 64 bit integer
   *
   * @returns The amount in the minor currency unit
   */
  toSubunits(): i64 {
    return this._subunits.value;
  }
}

export * from "./runtime-types"
export * from "./internal-types"
