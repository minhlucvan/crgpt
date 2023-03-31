import yaml from "js-yaml";
import { promises as fs } from "fs";
import { Config } from "../lib/types";
import { CrGPTCLIOptions } from "./types";

const DEFAULT_PROMPT = `Your task is to act as a code reviewer and review a pull request. Your output should focus on items mentioned in the given code review checklist. You need to summarize the changes made, identify potential issues related to logic and runtime, check that is the pull request is good to merge or not.
Instructions:
- Review the output of git diff for the pull request 
- Summarize the overview of the changes made in a bullet list
- Identify potential issues related to logic and runtime in a bullet list
- Output as a markdown document, with the following structure:
    {output}
- The response sentences are no longer than 16 words each
- Make sure that when there are no issues, there is no need to output the Issues section
- Remember to keep the response sentences short, no longer than 16 words each:
- Keep the response document as short as possible
- Focus on items mentioned in the following code review checklist:
    {checklist}`;

const DEFAULT_SUMMARY = `#### Changes:
- summarize the overview of the changes has made
#### Issues:    
- Identify potential issues related to logic and runtime.
- issues mentioned in the code review checklist

**Mergeable:** YES, NO or NEEDS IMPROVEMENT`;

const DEFAULT_CHECKLIST = `+ Check code structure against NestJS' recommended project structure.
  + Review for unnecessary files, folders, or code modules.
  + Verify adherence to Single Responsibility Principle (SRP) and Don't Repeat Yourself (DRY) principle.
  + Ensure all error scenarios are covered in the code.
  + Check for clear and helpful error messages.
  + Review for graceful error handling.
  + Verify secure storage of sensitive data and credentials.
  + Check external libraries and packages are up-to-date.
  + Ensure protection against common security vulnerabilities such as SQL injection and XSS.`;

const DEFAULT_CONFIG: Config = {
  output: "console",
  openai: {
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
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
    config.github = { ...config.github, accessToken: options.githubToken };
  }

  return config;
}
