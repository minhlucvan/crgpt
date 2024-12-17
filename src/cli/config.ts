import yaml from "js-yaml";
import { promises as fs } from "fs";
import { Config } from "../lib/types";
import { CrGPTCLIOptions } from "./types";
import { getEnvVar } from "../utils/os";

const DEFAULT_PROMPT = `Your task is to act as a code reviewer helper, your task is to review a pull request by analyze the git diff output. 
You need to summarize the changes made, identify potential any syntax, logic, best practices issues, and provide actionable feedback.
Instructions:
- Review the output of git diff for the the changes made in the pull request
- Summarize the changes made, and what was added, removed, or modified in a bullet list in a ưay that is easiest for the reviewer to understand
- Please ignore all change related to ui, style, formatting, and comments
- Identify potential issues related to logic and runtime errors in a bullet list
- Output as a markdown document, with the following structure:
{output}
- The response sentences are no longer than 16 words each
- Remember to keep the response sentences short, no longer than 16 words each:
- Keep the response document as short as possible
- Focus on items mentioned in the following code review checklist:
{checklist}
- Please ignore any changes that are not having clear action to take.
- Please ignore any changes that are not mentioned in the code review checklist.
`;

const DEFAULT_SUMMARY = `
    ## What Changed:
    - Summarize the changes made in general.
    - Describe what was added, removed, or modified in a bullet list.

    ## What's Wrong:
    - Identify any issues or problems in the code.
    - Point out any potential errors, bugs, or inconsistencies.
    - Highlight any potential risks or side effects.

    ## Recommendations:
    - Provide recommendations or suggestions for improvement, Only actionable feedback, no general comments.
    - Given clear and concise suggestions for improvement, no vague or ambiguous feedback.
    - Include any specific tasks or action items that need to be addressed.
    - Decide if the PR is good to merge.
    `;

const DEFAULT_CHECKLIST = `
    + Verify adherence to Single Responsibility Principle (SRP) and Don't Repeat Yourself (DRY) principle.
    + Ensure all error scenarios are covered in the code.
    + Check for clear and helpful error messages.
    + Review for graceful error handling.
    + Verify secure storage of sensitive data and credentials.
    + Check external libraries and packages are up-to-date.
    + Ensure protection against common security vulnerabilities.`;

const DEFAULT_CONFIG: Config = {
  output: getEnvVar("OUTPUT", "console") as "file" | "console" | "bitbucket" | "github",
  openai: {
    endpoint: getEnvVar("OPENAI_ENDPOINT", "https://api.openai.com/v1/chat/completions"),
    model: getEnvVar("OPENAI_MODEL", "gpt-4o-mini"),
    apiKey: getEnvVar("OPENAI_API_KEY", ""),
  },
  code: {
    gitDiffOArgs: getEnvVar("GIT_DIFF_ARGS", ""),
  },
  review: {
    prompt: DEFAULT_PROMPT,
    checklist: DEFAULT_CHECKLIST,
    summary: DEFAULT_SUMMARY,
    ignoreFiles: [],
    includes: ['**/*'],
    excludes: [
      '**/*.md', '**/*.json', '**/*.yml', '**/*.yaml', '**/*.lock', '**/*.lock.json', '**/*.lock.yaml', '**/*.lock.yml', 
      '**/*.lock.lock', '**/*.lock.lock.json', '**/*.lock.lock.yaml', '**/*.lock.lock.yml', '**/*.lock.lock.lock'
    ],
  },
  github: {
    accessToken: getEnvVar("GITHUB_TOKEN", ""),
  },
  bitbucket: {
    accessToken: getEnvVar("BITBUCKET_TOKEN", ""),
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

  if(options.model) {
    config.openai = {
      ...config.openai,
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

  
  if (options.githubToken) {
    config.github = {
      ...config.github,
      accessToken: options.githubToken,
    };
  }

  if(options.diffArgs) { 
    config.code = {
      ...config.code,
      gitDiffOArgs: options.diffArgs,
    };
  }

  if(options.projectSlug) {
    config.code = {
      ...config.code,
      projectSlug: options.projectSlug,
    };
  }

  if(options.repoSlug) {
    config.code = {
      ...config.code,
      repoSlug: options.repoSlug,
    };
  }

  if (options.githubToken) {
    config.github = { ...config.github, accessToken: options.githubToken };
  }

  return config;
}
