import { promises as fs } from 'fs';
import path from 'path';

const rootDir = path.join(process.cwd(), 'frontend-web', 'app');
const date = '2025-09-13';

async function processDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      let content = await fs.readFile(fullPath, 'utf8');
      if (content.includes('작성자: LSH')) continue;
      const header = `/**\n * 파일명: ${entry.name}\n * 작성자: LSH\n * 갱신일: ${date}\n * 설명: \n */\n`;
      if (content.startsWith('\'use client\'') || content.startsWith('"use client"') || content.startsWith('\'use server\'') || content.startsWith('"use server"')) {
        const lines = content.split(/\r?\n/);
        const firstLine = lines.shift();
        content = `${firstLine}\n${header}${lines.join('\n')}`;
      } else {
        content = header + content;
      }
      await fs.writeFile(fullPath, content);
    }
  }
}

processDir(rootDir);
