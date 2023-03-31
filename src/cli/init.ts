import yaml from 'js-yaml';
import { promises as fs } from 'fs';
import { CrGPTCLIOptions } from './types';
import { fileExists, prepareConfig } from './config';

export async function initCRGPT(configPath: string, options: CrGPTCLIOptions): Promise<void> {
  const configFileExists = await fileExists(configPath);
  if (configFileExists) {
    console.error(`Error: Config file already exists at ${configPath}`);
    return;
  }
  const config = await prepareConfig(configPath, options);
  try {
    await fs.writeFile(configPath, yaml.dump(config));
    console.log(`Default config file created at ${configPath}`);
  } catch (error) {
    console.error(`Error creating config file: ${error}`);
  }
}
