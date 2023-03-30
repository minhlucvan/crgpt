import yaml from 'js-yaml';
import { promises as fs } from 'fs';
import { Config } from '../lib/types';
import { CrGPTCLIOptions } from './types';

export async function initCRGPT(configPath: string, options: CrGPTCLIOptions): Promise<void> {
  const defaultConfig: Config = {
    openai: {
      endpoint: 'https://api.openai.com/v1/engines/davinci-codex/completions',
      apiKey: options.aiToken || '',
    },
    review: {
      prompt: '',
      checklist: '',
      summary: '',
    },
  };

  const configFileExists = await fileExists(configPath);
  if (configFileExists) {
    console.error(`Error: Config file already exists at ${configPath}`);
    return;
  }

  try {
    await fs.writeFile(configPath, yaml.dump(defaultConfig));
    console.log(`Default config file created at ${configPath}`);
  } catch (error) {
    console.error(`Error creating config file: ${error}`);
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}
