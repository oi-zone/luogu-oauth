const eslint = "eslint --fix";
const prettier = "prettier --write";

module.exports = {
  "*.{js,mjs,cjs,ts,jsx,tsx}": [eslint, prettier],
  "*.{html,css,json,yml,yaml}": [prettier],
};
