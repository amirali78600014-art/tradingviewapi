const { spawn } = require('child_process');

// Start the forex test server
const server = spawn('node', ['forex-test-server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});