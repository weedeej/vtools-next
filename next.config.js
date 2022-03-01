module.exports = {
  reactStrictMode: true,
  redirects() {
    return [
      process.env.MAINTENANCE_MODE === "true"
        ? { source: "/((?!maintenance|images|assets).*)", destination: "/maintenance", permanent: false}
        : null,
    ].filter(Boolean);
  }
}
