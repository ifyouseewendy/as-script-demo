import { Slice } from "./runtime-types";

export namespace InternalTypes {

  export type ID = u64;
  export type Int = i32;
  export type Float = f64;

  /**
   * This type is an adapter type around a i64 as understood in AssemblyScript.
   * The goal is for it to encapsulate how this gets represented "over the wires"
   *
   * As of now we use GraphQL, which only gives us `Int`, or a 32 bit wide signed integer.
   * This implementation will fallback to a `Str` representation of the value if it would overflow the i32
   *
   * These types are intended only for that very purpose. As such they don't have any operator overloads or any other
   * additional support than a constructor and a matching getter `#value` to retrieve the primitive type.
   * We expect users to not rely on these adapter types for anything else than transferring data in and
   * out of the AssemblyScript runtime.
   */
  @unmanaged()
  export class i64_t {
    private readonly _value: Int;
    private readonly _valueOverflow: Str;

    constructor(value: i64) {
      if (value < I32.MAX_VALUE && value > I32.MIN_VALUE) {
        this._value = value as i32;
      } else {
        this._valueOverflow = Str.from(value.toString());
      }
    }

    get value(): i64 {
      if (this._valueOverflow.length > 0) {
        return I64.parseInt(this._valueOverflow.toString());
      } else {
        return this._value as i64;
      }
    }
  }

  @unmanaged
  export class Str extends Slice<u8> {
    @inline
    static from(string: String): Str {
      return <Str>Slice.fromArrayBuffer(String.UTF8.encode(string));
    }

    @operator("==")
    private __eq(other: Str): bool {
      return this.toString() == other.toString();
    }

    @operator("!=")
    private __ne(other: Str): bool {
      return !this.__eq(other);
    }

    @operator("+")
    concat(other: String): String {
      return this.toString() + other;
    }

    toString(): String {
      return String.UTF8.decodeUnsafe(<usize>this._data, <usize>this._length);
    }
  }
}
