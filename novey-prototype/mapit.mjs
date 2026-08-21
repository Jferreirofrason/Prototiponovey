import { readFileSync } from 'fs';
import { SourceMapConsumer } from 'source-map';
const raw = JSON.parse(readFileSync('dist/assets/index-CjixbTd3.js.map','utf8'));
const consumer = await new SourceMapConsumer(raw);
const positions = [[8,91976],[8,109754],[8,108992],[8,109356],[8,109054],[8,109124]];
for (const [line,col] of positions) {
  const o = consumer.originalPositionFor({ line, column: col });
  console.log(`min ${line}:${col} -> ${o.source}:${o.line}:${o.column} name=${o.name}`);
}
consumer.destroy();
