/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    // stub plain CSS imports so tests don't crash on `import "./x.css"`
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: ["/node_modules/"],
};

module.exports = config;
