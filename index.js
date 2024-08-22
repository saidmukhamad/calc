import readline from "readline";
import http from "http";
import url from "url";

export function Calculator() {}

Calculator.prototype.evaluate = function (expression) {
  expression = expression.replace(/\s+/g, "");
  return this.evaluateExpression(expression);
};

Calculator.prototype.evaluateExpression = function (expression) {
  const tokens = this.tokenize(expression);
  const output = [];
  const operators = [];

  for (let token of tokens) {
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
      while (operators.length > 0 && this.precedence(operators[operators.length - 1]) >= this.precedence(token)) {
        output.push(operators.pop());
      }
      operators.push(token);
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop());
  }

  return this.evaluatePostfix(output);
};

Calculator.prototype.tokenize = function (expression) {
  return expression.match(/(\d+\.?\d*|\+|\-|\*|\/|\(|\))/g) || [];
};

Calculator.prototype.isNumber = function (token) {
  return !isNaN(parseFloat(token)) && isFinite(token);
};

Calculator.prototype.isOperator = function (token) {
  return ["+", "-", "*", "/"].includes(token);
};

Calculator.prototype.precedence = function (operator) {
  if (operator === "+" || operator === "-") return 1;
  if (operator === "*" || operator === "/") return 2;
  return 0;
};

Calculator.prototype.evaluatePostfix = function (tokens) {
  const stack = [];

  for (let token of tokens) {
    if (this.isNumber(token)) {
      stack.push(token);
    } else if (this.isOperator(token)) {
      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          if (b === 0) return "Error: Division by zero";
          stack.push(a / b);
          break;
      }
    }
  }

  return stack[0];
};

const calc = new Calculator();

function runCLI() {
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
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runServer() {
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

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes("--server")) {
  runServer();
} else {
  runCLI();
}
