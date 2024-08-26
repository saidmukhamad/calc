import readline from "readline";
import fs from "fs/promises";
import http from "http";
import url from "url";
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Calculator {
  constructor() {
    this.operators = {
      "+": { precedence: 1, associativity: "left", operation: (a, b) => a + b },
      "-": { precedence: 1, associativity: "left", operation: (a, b) => a - b },
      "*": { precedence: 2, associativity: "left", operation: (a, b) => a * b },
      "/": { precedence: 2, associativity: "left", operation: (a, b) => (b !== 0 ? a / b : "Error: Division by zero") },
      "^": { precedence: 3, associativity: "right", operation: (a, b) => Math.pow(a, b) },
    };
  }

  addOperator(symbol, precedence, associativity, operation) {
    this.operators[symbol] = { precedence, associativity, operation };
  }

  evaluate(expression) {
    expression = expression.replace(/\s+/g, "");
    return this.evaluateExpression(expression);
  }

  evaluateExpression(expression) {
    const tokens = this.tokenize(expression);
    const output = [];
    const operators = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (this.isNumber(token)) {
        output.push(parseFloat(token));
      } else if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (operators.length > 0 && operators[operators.length - 1] !== "(") {
          output.push(operators.pop());
        }
        operators.pop(); // Remove the '('
      } else if (this.isOperator(token)) {
        if (token === "-" || token === "+") {
          if (i === 0 || this.isOperator(tokens[i - 1]) || tokens[i - 1] === "(") {
            output.push(token === "-" ? -1 : 1);
            operators.push("*");
            continue;
          }
        }
        while (
          operators.length > 0 &&
          this.operators[operators[operators.length - 1]] &&
          ((this.operators[token].associativity === "left" && this.operators[token].precedence <= this.operators[operators[operators.length - 1]].precedence) ||
            (this.operators[token].associativity === "right" && this.operators[token].precedence < this.operators[operators[operators.length - 1]].precedence))
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      }
    }

    while (operators.length > 0) {
      output.push(operators.pop());
    }

    return this.evaluatePostfix(output);
  }

  tokenize(expression) {
    return expression.match(/(\d+\.?\d*|\+|\-|\*|\/|\^|\(|\))/g) || [];
  }

  isNumber(token) {
    return !isNaN(parseFloat(token)) && isFinite(token);
  }

  isOperator(token) {
    return this.operators.hasOwnProperty(token);
  }

  evaluatePostfix(tokens) {
    const stack = [];

    for (let token of tokens) {
      if (this.isNumber(token)) {
        stack.push(token);
      } else if (this.isOperator(token)) {
        const b = stack.pop();
        const a = stack.pop();
        const result = this.operators[token].operation(a, b);
        stack.push(result);
      }
    }

    return stack[0];
  }
}

export function runCLI() {
  const calc = new Calculator();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function promptUser() {
    rl.question("Enter calculation (or q to quit): ", (input) => {
      if (input.toLowerCase() === "q") {
        rl.close();
        return;
      }

      const result = calc.evaluate(input);
      console.log(`Result: ${result}`);
      promptUser();
    });
  }

  console.log("CLI Calculator");
  console.log('Enter your calculation, e.g., "1 + (2 + 3) * 4 - 12"');
  promptUser();
}

export function runServer() {
  const calc = new Calculator();
  calc.addOperator("^", 3, "right", (a, b) => Math.pow(a, b));

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/") {
      if (req.method === "GET") {
        try {
          const content = await fs.readFile(path.join(__dirname, "index.html"), "utf-8");
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        } catch (error) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      }
    } else if (parsedUrl.pathname === "/calculate" && req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const { expression } = JSON.parse(body);
        const result = calc.evaluate(expression);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result: result ? result : "https://www.youtube.com/watch?v=dQw4w9WgXcQ?" }));
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
}

const args = process.argv.slice(2);

if (args.includes("--server")) {
  runServer();
} else {
  runCLI();
}
