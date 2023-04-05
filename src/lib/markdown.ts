import fs from 'fs';
import { Config, ReviewSumary } from './types';

export async function writeCodeReviewToFile(
  result: ReviewSumary,
  config: Config,
): Promise<any> {
  if (!config.file) {
    throw new Error(`GitHub configuration is not provided`);
  }

  const { path, name } = config.file;
  const fileName = `${path}/${name}`;
  const commentContent = result.content;

  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, commentContent, 'utf8', (err) => {
      if (err) {
        console.log(`Error writing comment to file: ${err.message}`);
        reject(new Error(`Error writing comment to file: ${err.message}`));
      } else {
        console.log(`Code review comment saved to file: ${fileName}`);
        resolve(`Code review comment saved to file: ${fileName}`);
      }
    });
  });
}
