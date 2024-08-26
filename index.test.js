import { strict as assert } from "assert";
import { Calculator } from "./index.js";
import { test } from "node:test";

const calc = new Calculator();

calc.addOperator("^", 3, "right", (a, b) => Math.pow(a, b));

const testCases = ["2 + 3 * 4", "(2 + 3) * 4", "2 ^ 3", "-5 + 3", "+2 - 5", "2 ^ 3 + 4 * 2", "10 / (2 + 3)", "2 ^ (3 + 1)"];

testCases.forEach((expression) => {
  console.log(`${expression} = ${calc.evaluate(expression)}`);
});
