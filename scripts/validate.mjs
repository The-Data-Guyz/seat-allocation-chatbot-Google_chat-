import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const projectRoot = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(projectRoot, 'src');
const failures = [];

for (const filename of fs.readdirSync(sourceDir).sort()) {
  const fullPath = path.join(sourceDir, filename);

  if (filename.endsWith('.js')) {
    try {
      const source = fs.readFileSync(fullPath, 'utf8');
      new vm.Script(source, { filename });
      console.log(`✓ ${filename}`);
    } catch (error) {
      failures.push(`${filename}: ${error.message}`);
    }
  }
}

try {
  JSON.parse(fs.readFileSync(path.join(sourceDir, 'appsscript.json'), 'utf8'));
  console.log('✓ appsscript.json');
} catch (error) {
  failures.push(`appsscript.json: ${error.message}`);
}

if (failures.length > 0) {
  console.error('\nValidation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('\nRepository source validation passed.');
