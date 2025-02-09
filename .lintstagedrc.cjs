const eslint = "eslint --fix";
const prettier = "prettier --write";
const prisma = "prisma format --schema";

module.exports = {
  "*.{js,mjs,cjs,ts,jsx,tsx}": [eslint, prettier],
  "*.{md,html,css,json,yml,yaml}": [prettier],
  "*.prisma": [prisma],
};
