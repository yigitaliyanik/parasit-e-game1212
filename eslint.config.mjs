/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      ".vercel/**",
      "node_modules/**",
      "public/**",
      ".next/**",
      "dist/**",
      "build/**"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off"
    }
  }
];
