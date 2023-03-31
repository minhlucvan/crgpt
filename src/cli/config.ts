import yaml from 'js-yaml';
import { promises as fs } from 'fs';
import { Config } from '../lib/types';

export async function readConfig(configFile: string): Promise<Config> {
    try {
      const fileContents = await fs.readFile(configFile, 'utf8');
      const config = yaml.load(fileContents) as Config;

      if (!config) {
        throw new Error('Config file is empty');
      }

      return config;
    } catch (error) {
      throw new Error(`Error reading config file`);
    }
  }