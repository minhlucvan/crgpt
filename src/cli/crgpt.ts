#!/usr/bin/env node

import { Command, Argument } from "commander";
import { runCRGPTCLI } from "../lib";
import { prepareConfig } from "./config";
import { initCRGPT } from "./init";
import { CrGPTCLIOptions } from "./types";

const program = new Command();

program
  .description("Run CRGPT on a pull request")
  .addArgument(
    new Argument("<action>", "Action to perform")
      .choices(["init", "review", "preview", "diff", "desc"])
      .default("review", "Code review")
  )
  .option("-o, --output <output>", "output method")
  .option("-s, --source <source>", "Source branch name")
  .option("-t, --target <target>", "Target branch name")
  .option("-d, --diff-args [diffArgs]", "Git diff arguments")
  .option("-p, --prId [prId]", "Pull request ID")
  .option("-m, --model [model]", "Openai model", "gpt-3.5-turbo")
  .option("-co, --commit [commitId]", "Commit ID")
  .option("-ps, --project-slug [projectSlug]", "Bitbucket project slug")
  .option("-rs, --repo-slug [repoSlug]", "Bitbucket repo slug")
  .option("-at, --ai-token [accessToken]", "Openai Access token")
  .option("-gt, --github-token [accessToken]", "Github Access token")
  .option("-bt, --bitbucket-token [accessToken]", "Bitbucket Access token")
  .option("-c, --config [config]", "Config file path", ".crgpt.yml")
  .action(async (action: string, options: CrGPTCLIOptions) => {
    try {
      const {
        prId,
        source: sourceBranch = "HEAD",
        target: targetBranch = "main",
        config: configPath,
      } = options;

      switch (action) {
        case "init":
          await initCRGPT(configPath, options);
          break;
        case "review":
          const config = await prepareConfig(configPath, options);
          if (!sourceBranch || !targetBranch) {
            throw new Error("Please provide source and target branch names");
          }
          await runCRGPTCLI({ sourceBranch, targetBranch, prId }, config);
          break;
        case 'preview':
          const previewConfig = await prepareConfig(configPath, options);
          // perform preview un-committed changes
          await runCRGPTCLI({ sourceBranch: 'HEAD', targetBranch: 'HEAD', prId }, previewConfig);
          break;
        case "diff":
          throw new Error("Not implemented");
        case "desc":
          throw new Error("Not implemented");
        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);
