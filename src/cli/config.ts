import yaml from "js-yaml";
import { promises as fs } from "fs";
import { Config } from "../lib/types";
import { CrGPTCLIOptions } from "./types";

const DEFAULT_PROMPT = `Your task is to act as a code reviewer, and review a pull request by analyze the git diff. You need to summarize the changes made, identify potential issues related to logic and runtime issue, check that is the pull request is good to merge or not.
Instructions:
- Review the output of git diff for the pull request 
- Summarize the changes made, and what was added, removed, or modified in a bullet list
- Please ignore all change related to ui, style, formatting, and comments
- Identify potential issues related to logic and runtime errors in a bullet list
- Output as a markdown document, with the following structure:
{output}
- The response sentences are no longer than 16 words each
- Remember to keep the response sentences short, no longer than 16 words each:
- Keep the response document as short as possible
- Focus on items mentioned in the following code review checklist:
{checklist}`;

const DEFAULT_SUMMARY = `
    ## What Changed:
    - Summarize the changes made in general.
    - Describe what was added, removed, or modified in a bullet list.

    ## What's Wrong:
    - Identify any issues or problems in the code.
    - Point out any potential errors, bugs, or inconsistencies.
    - Highlight any potential risks or side effects.

    ## What Could be Improved:
    - Suggest improvements or optimizations that could be made.
    - Provide feedback on coding style, naming convention, and best practices.
    - Point out areas where the code could be made more maintainable.

    ## Mergeable: YES/NO or Review Needed `;

const DEFAULT_CHECKLIST = `
    + Verify adherence to Single Responsibility Principle (SRP) and Don't Repeat Yourself (DRY) principle.
    + Ensure all error scenarios are covered in the code.
    + Check for clear and helpful error messages.
    + Review for graceful error handling.
    + Verify secure storage of sensitive data and credentials.
    + Check external libraries and packages are up-to-date.
    + Ensure protection against common security vulnerabilities.`;

const DEFAULT_CONFIG: Config = {
  output: "console",
  openai: {
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",
    apiKey: "",
  },
  code: {
    gitDiffOArgs: "",
  },
  review: {
    prompt: DEFAULT_PROMPT,
    checklist: DEFAULT_CHECKLIST,
    summary: DEFAULT_SUMMARY,
    ignoreFiles: [],
  },
};

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

export async function readConfig(configFile: string): Promise<Config> {
  try {
    const fileContents = await fs.readFile(configFile, "utf8");
    const config = yaml.load(fileContents) as Config;

    if (!config) {
      throw new Error("Config file is empty");
    }

    return config;
  } catch (error) {
    throw new Error(`Error reading config file`);
  }
}

export async function prepareConfig(
  configFile: string,
  options: CrGPTCLIOptions
): Promise<Config> {
  let config = DEFAULT_CONFIG;
  if (await fileExists(configFile)) {
    config = await readConfig(configFile);
  }

  if(options.output) {
    config.output = options.output;
  }

  if(options.diffArgs) { 
    config.code = {
      ...config.code,
      gitDiffOArgs: options.diffArgs,
    };
  }

  if (options.aiToken) {
    config.openai.apiKey = options.aiToken;
  }

  if (options.bitbucketToken) {
    config.bitbucket = {
      ...config.bitbucket,
      accessToken: options.bitbucketToken,
    };
  }

  if(options.projectSlug) {
    config.bitbucket = {
      ...config.bitbucket,
      owner: options.projectSlug,
    };
  }

  if(options.repoSlug) {
    config.bitbucket = {
      ...config.bitbucket,
      repoSlug: options.repoSlug,
    };
  }

  if (options.githubToken) {
    config.github = { ...config.github, accessToken: options.githubToken };
  }

  return config;
}
