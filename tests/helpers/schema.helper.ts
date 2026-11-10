import Ajv, { type AnySchema } from "ajv";
import { expect } from "@playwright/test";

const ajv = new Ajv({ allErrors: true });

export function expectMatchesSchema(data: unknown, schema: AnySchema): void {
  const validate = ajv.compile(schema);
  const isValid = validate(data);

  expect(isValid, `schema validation failed: ${ajv.errorsText(validate.errors, { separator: "; " })}`).toBe(true);
}
