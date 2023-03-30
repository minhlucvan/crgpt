import yaml from 'js-yaml';
import { promises as fs } from 'fs';
import { Config } from '../lib/types';

export async function readConfig(configFile: string): Promise<Config> {
    try {
      const fileContents = await fs.readFile(configFile, 'utf8');
      return yaml.load(fileContents) as Config;
    } catch (error) {
      throw new Error(`Error reading config file`);
    }
  }