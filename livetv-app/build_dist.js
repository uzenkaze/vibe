const path = require('path');
// Root directory is one level up if run inside livetv-app
const rootDir = path.resolve(__dirname, '..');
process.chdir(rootDir);
require(path.join(rootDir, 'build_dist.js'));
