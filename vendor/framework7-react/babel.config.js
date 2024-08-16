const config = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: false,
        targets: "> 0.25%, not dead",
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    ['@babel/plugin-proposal-decorators', {'legacy': true }],
    ['@babel/plugin-transform-class-properties', { 'loose': false }],
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-transform-react-inline-elements",
    "@babel/plugin-transform-react-constant-elements",
  ]
};

export default config;
