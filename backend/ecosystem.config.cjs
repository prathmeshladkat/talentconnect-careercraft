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
      },
      
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    }
   
  ]
};
