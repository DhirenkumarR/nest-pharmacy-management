import { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL decimal/numeric columns return values as strings to prevent precision loss.
 * This transformer automatically parses those database strings into JavaScript numbers (floats) on load,
 * and passes them as-is when saving to the database.
 */
export class ColumnNumericTransformer implements ValueTransformer {
  // To database (when writing)
  to(data: number | null): number | null {
    return data;
  }

  // From database (when reading)
  from(data: string | null): number | null {
    return data ? parseFloat(data) : null;
  }
}
