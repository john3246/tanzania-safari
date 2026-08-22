const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function main() {
  const pdfPath = process.argv[2] || path.join(__dirname, '..', 'data', 'accommodation-in-tanzania.pdf');
  const buf = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text || result;
  const out = path.join(__dirname, '..', 'scratch', 'accommodation-pdf.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, typeof text === 'string' ? text : JSON.stringify(result, null, 2), 'utf8');
  console.log('chars', (typeof text === 'string' ? text : JSON.stringify(result)).length, '->', out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


main().catch((e) => {
  console.error(e);
  process.exit(1);
});
