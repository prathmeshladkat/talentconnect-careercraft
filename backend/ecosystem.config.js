module.exports = {
  apps: [
    {
      name: "talentconnect-test-api",
      script: "server.js",
      cwd: "/var/www/careerkrafter/careerkrafter-test/talentconnect-careercraft/backend",
      env: {
        PORT: 5001,
        NODE_ENV: "test",
        SENDGRID_API_KEY: "dummy"
      }
    }
  ]
};
