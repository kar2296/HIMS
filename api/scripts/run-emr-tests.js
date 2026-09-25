const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log(' EMR Module — Automated Test Suite Runner');
console.log('====================================================');

const apiDir = path.resolve(__dirname, '..');

// 1. Compile EMRModule.spec.ts
console.log('1. Compiling EMR test suite with TypeScript...');
try {
    execSync('npx tsc src/Server/Modules/EMR/Router/EMRModule.spec.ts --outDir dist/dev/Server/Modules/EMR/Router/ --target es2018 --module commonjs --skipLibCheck', {
        cwd: apiDir,
        stdio: 'inherit'
    });
    console.log('Compilation successful.');
} catch (err) {
    console.error('Compilation failed:', err.message);
    process.exit(1);
}

// 2. Locate jasmine-node
let jasmineNodeBin = null;
const possiblePaths = [
    path.join(apiDir, 'node_modules/.bin/jasmine-node'),
    path.join(apiDir, '../node_modules/.bin/jasmine-node'),
    '/Users/sharmila/.npm/_npx/b6a9634927caf8dc/node_modules/jasmine-node/bin/jasmine-node'
];

for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        jasmineNodeBin = p;
        break;
    }
}

if (!jasmineNodeBin) {
    try {
        const found = execSync('find ~/.npm/_npx -name "jasmine-node" -type f 2>/dev/null', { encoding: 'utf8' }).trim().split('\n')[0];
        if (found && fs.existsSync(found)) {
            jasmineNodeBin = found;
        }
    } catch (_) {}
}

if (!jasmineNodeBin) {
    console.error('Error: Could not locate jasmine-node binary.');
    process.exit(1);
}

console.log('2. Running Jasmine test suite against live API on port 2012...');
const specPath = path.join(apiDir, 'dist/dev/Server/Modules/EMR/Router/EMRModule.spec.js');
const cmd = `node "${jasmineNodeBin}" "${specPath}" --forceexit`;

try {
    execSync(cmd, {
        cwd: apiDir,
        stdio: 'inherit'
    });
    console.log('\n====================================================');
    console.log(' ALL EMR AUTOMATED TESTS COMPLETED SUCCESSFULLY (100% PASS)');
    console.log('====================================================');
    process.exit(0);
} catch (err) {
    console.error('\nTest run failed with error code:', err.status);
    process.exit(1);
}
