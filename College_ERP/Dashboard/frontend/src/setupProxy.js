// Forwards every /api request from the React dev server to the backend.
// The browser then only talks to ONE address (the React app), so there is no CORS
// problem and the backend port never has to be opened or made public.
// Used when REACT_APP_API_URL=/api (see .env.example). Ignored when it is a full URL.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.BACKEND_URL || "http://localhost:8000",
      changeOrigin: true,
    })
  );
};
