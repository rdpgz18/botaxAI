const { exec } = require('child_process');
const path = require('path');

// Jalankan server.js
const serverProcess = exec('node server.js', {
  cwd: __dirname
});

serverProcess.stdout.on('data', (data) => {
  console.log(`Server: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

// Auto-buka browser
exec(`start http://localhost:3000`); // Windows
// exec(`open http://localhost:3000`); // Mac