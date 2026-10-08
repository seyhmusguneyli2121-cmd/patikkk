const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const files = ['index.html', 'style.css', 'script.js', 'enhancements.js'];
const root = __dirname;
const output = path.join(root, 'dist');

try {
  for (const name of files) {
    const source = fs.readFileSync(path.join(root, name), 'utf8');
    if (name.endsWith('.js')) new vm.Script(source, { filename: name });
  }
  if (!fs.statSync(path.join(root, 'assets', 'pati-dostlari.png')).isFile()) {
    throw new Error('Ana sayfa görseli bulunamadı.');
  }
  fs.mkdirSync(output, { recursive: true });
  for (const name of files) fs.copyFileSync(path.join(root, name), path.join(output, name));
  fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  console.log('PatimiKoru hazır: dist/');
} catch (error) {
  console.error('Dist oluşturulamadı:', error.message);
  process.exitCode = 1;
}
