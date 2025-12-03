// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/inventario/:path*",
        destination: "http://localhost:8080/inventario/:path*",
      },
    ];
  },
};
