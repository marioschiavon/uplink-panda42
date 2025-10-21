module.exports = {
  apps: [
    {
      name: "uplink-bridge",
      script: "dist/index.js",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
