export default {
  apps: [
    {
      name: "uplink-bridge",
      script: "dist/index.js",
      env: { NODE_ENV: "production" }
    }
  ]
}
