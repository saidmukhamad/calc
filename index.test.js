import { strict as assert } from "assert";
import { Calculator } from "./index.js";
import { test } from "node:test";

test("Calculator", async (t) => {
  const calc = new Calculator();

  await t.test("should evaluate simple expressions correctly", () => {
    assert.equal(calc.evaluate("1 + 2"), 3);
    assert.equal(calc.evaluate("5 - 3"), 2);
    assert.equal(calc.evaluate("4 * 3"), 12);
    assert.equal(calc.evaluate("12 / 4"), 3);
  });

  await t.test("should handle expressions with multiple operations", () => {
    assert.equal(calc.evaluate("1 + 2 * 3"), 7);
    assert.equal(calc.evaluate("10 - 2 * 3"), 4);
    assert.equal(calc.evaluate("20 / 4 + 2"), 7);
  });

  await t.test("should respect parentheses", () => {
    assert.equal(calc.evaluate("(1 + 2) * 3"), 9);
    assert.equal(calc.evaluate("10 - (2 + 3)"), 5);
    assert.equal(calc.evaluate("(4 + 6) / (1 + 1)"), 5);
  });

  await t.test("should handle nested parentheses", () => {
    assert.equal(calc.evaluate("((1 + 2) * 3) + 4"), 13);
    assert.equal(calc.evaluate("(10 - (2 + 3)) * 2"), 10);
  });

  await t.test("should handle decimal numbers", () => {
    assert.equal(calc.evaluate("1.5 + 2.5"), 4);
    assert.equal(calc.evaluate("3.14 * 2"), 6.28);
  });

  await t.test('should return "Error: Division by zero" for division by zero', () => {
    assert.equal(calc.evaluate("5 / 0"), "Error: Division by zero");
    assert.equal(calc.evaluate("10 / (5 - 5)"), "Error: Division by zero");
  });

  await t.test("should handle expressions with spaces correctly", () => {
    assert.equal(calc.evaluate(" 1 +  2 "), 3);
    assert.equal(calc.evaluate("4 *    3"), 12);
  });

  await t.test("should return NaN for invalid expressions", () => {
    assert(isNaN(calc.evaluate("1 + + 2")));
  });
});
