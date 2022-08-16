const eslint = "eslint --fix";
const prettier = "prettier --write";
const prettierCheck = "prettier --check";

module.exports = {
  "*.{js,mjs,cjs,ts,jsx,tsx,vue}": [eslint, prettierCheck],
  "*.{json,yml,yaml,html,md}": [prettier],
};
