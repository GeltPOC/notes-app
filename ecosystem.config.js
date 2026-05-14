module.exports = {
  apps: [{
    name: 'notes-app',
    script: 'npm',
    args: 'start -- -p 3005',
    cwd: '/home/gelt/apps/notes-app',
    env: {
      NODE_ENV: 'production',
      PORT: 3005,
    },
  }],
}
