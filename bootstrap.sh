#!/bin/zsh
set -e

# avoid zsh history expansion issues
set +H

# 0) init npm
if [ ! -f package.json ]; then
  npm init -y >/dev/null
fi

# 1) install deps
npm i express dotenv
npm i -D typescript ts-node nodemon @types/node @types/express

# 2) folders
mkdir -p src

# 3) tsconfig
cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": false
  },
  "include": ["src"]
}
JSON

# 4) app.ts
cat > src/app.ts <<'TS'
import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/whatsapp", (req, res) => {
  console.log("INCOMING /whatsapp:", req.body);
  res.sendStatus(200);
});

export default app;
TS

# 5) index.ts
cat > src/index.ts <<'TS'
import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});
TS

# 6) env
if [ ! -f .env ]; then
  echo "PORT=8080" > .env
fi

# 7) package.json scripts
node <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.scripts ||= {};
pkg.scripts.dev = "nodemon --watch src --ext ts --exec ts-node src/index.ts";
pkg.scripts.build = "tsc -p tsconfig.json";
pkg.scripts.start = "node dist/index.js";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
NODE

echo ""
echo "✅ Bootstrap complete."
echo "Run:"
echo "  npm run dev"
echo ""
echo "Test:"
echo "  curl -X POST http://localhost:8080/whatsapp -H 'Content-Type: application/json' -d '{\"ping\":\"ok\"}'"
