#!/usr/bin/env node

import { Command, Argument } from 'commander';
import { runCRGPT, runCRGPTCLI } from '../lib';
import { readConfig } from './config';
import { initCRGPT } from './init';
import { CrGPTCLIOptions } from './types';

const program = new Command();

program
  .command('crgpt')
  .addArgument(
    new Argument('<action>', 'Action to perform')
      .choices(['init', 'review', 'diff', 'desc'])
      .default('review', 'Code review')
  )
  .option('-s, --source <source>', 'Source branch name')
  .option('-t, --target <target>', 'Target branch name')
  .option('-p, --prId [prId]', 'Pull request ID')
  .option('-at, --ai-token [accessToken]', 'Openai Access token')
  .option('-gt, --github-token [accessToken]', 'Github Access token')
  .option('-bt, --bitbucket-token [accessToken]', 'Bitbucket Access token')
  .option('-c, --config [config]', 'Config file path', '.crgpt.yml')
  .description('Run CRGPT on a pull request')
  .action(async (options: CrGPTCLIOptions) => {
    try {
      const {
        action,
        source: sourceBranch,
        target: targetBranch,
        prId,
        config: configPath,
      } = options;

      const config = await readConfig(configPath);

      switch (action) {
        case 'init':
          await initCRGPT(configPath, options);
        case 'review':
          if (!sourceBranch || !targetBranch) {
            throw new Error('Please provide source and target branch names');
          }
          await runCRGPT({ sourceBranch, targetBranch, prId }, config);
        case 'diff':
          throw new Error('Not implemented');
        case 'desc':
          throw new Error('Not implemented');
        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);
