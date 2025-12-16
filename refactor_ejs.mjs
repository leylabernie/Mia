import fs from 'fs/promises';
import path from 'path';

const viewsDir = 'views';
const headerContent = `<%- include('partials/header') %>`;
const footerContent = `<%- include('partials/footer') %>`;

async function main() {
  const files = await fs.readdir(viewsDir);
  for (const file of files) {
    if (path.extname(file) === '.ejs') {
      const filePath = path.join(viewsDir, file);
      let content = await fs.readFile(filePath, 'utf-8');

      // Remove header
      const bodyIndex = content.indexOf('<body');
      if (bodyIndex !== -1) {
          const navEndIndex = content.indexOf('</nav>', bodyIndex);
          if (navEndIndex !== -1) {
            content = content.substring(navEndIndex + 7);
          }
      }

      // Remove footer
      const footerIndex = content.indexOf('<footer');
      if (footerIndex !== -1) {
        content = content.substring(0, footerIndex);
      }

      const newContent = `${headerContent}\n${content}\n${footerContent}`;
      await fs.writeFile(filePath, newContent);
    }
  }
}

main().catch(console.error);
