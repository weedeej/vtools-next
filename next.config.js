module.exports = {
  reactStrictMode: true,
  async headers()
  {
    return [
      {
        source: ":/api*",
        headers: { "content-type": "application/json" }
      }
    ]
  }
}
