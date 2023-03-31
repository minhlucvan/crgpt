import { exec } from 'child_process';
import fetch from 'node-fetch';
import {
  Config,
  Diff,
  FileReviewResult,
  ReviewSumary,
  runCRGPTOptions,
} from './types';
import { postCommentToBitbucketPR } from './bitbucket';
import { postCommentToGithubPR } from './github';
import { writeCodeReviewToFile } from './markdown';
import { printCodeReviewToConsole } from './stdout';

async function generateDiffs(
  sourceBranch: string,
  targetBranch: string,
  config: Config,
): Promise<Diff[]> {
  const command = `git diff ${sourceBranch}..${targetBranch} --name-only`;
  const ignoreFiles = config.review.ignoreFiles || [];

  return new Promise((resolve, reject) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error: ${error.message}`));
        return;
      }

      if (stderr) {
        reject(new Error(`Stderr: ${stderr}`));
        return;
      }

      const files = stdout.trim().split('\n');
      const diffs = await Promise.all(
        files.filter(file => !ignoreFiles.includes(file)).map(async (file) => {
          const diffCommand = `git diff ${sourceBranch}..${targetBranch} -- "${file}"`;
          const diff = await execAsync(diffCommand);
          return { file, diff };
        })
      );

      resolve(diffs);
    });
  });
}

async function execAsync(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error: ${error.message}`));
        return;
      }
      if (stderr) {
        reject(new Error(`Stderr: ${stderr}`));
        return;
      }

      resolve(stdout);
    });
  });
}

async function postDiffToEndpoint(
  diffData: string,
  config: Config
): Promise<string> {
  if(!config.openai) { 
    throw new Error('Error: OpenAI config not found');
  }

  const endpointUrl = config.openai.endpoint;
  const apiKey = config.openai.apiKey;
  const promptTml = config.review.prompt;
  const checklist = config.review.checklist;
  const summary = config.review.summary
  const prompt = promptTml.replace('{checklist}', checklist).replace('{output}', summary);
  
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-0301',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: diffData,
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`Error posting diff to endpoint: ${response.statusText}`);
  }
  const data = await response.json();
  const { choices } = data as { choices: { message: { content: string } }[] };
  const { message } = choices[0];
  const { content } = message;
  return content;
}

async function processDiffs(
  diffData: Diff[],
  config: Config,
  prId?: string
): Promise<FileReviewResult[]> {
  return Promise.all(
    diffData.map(async ({ file, diff }) => {
      console.log(`Processing file: ${file}`);
      const result = (await postDiffToEndpoint(diff, config)) as string;
      return { file, review: result };
    })
  );
}

async function summarizeCRContent(
  results: FileReviewResult[],
  config: Config
): Promise<ReviewSumary> {
  const header = '# Code Review Summary:';
  const fileSummaries = results
    .map(({ file, review }) => `---+----<br /> ### ${file}\n  \n${review}`)
    .join('\n\n');
  const content = `${header}\n\n${fileSummaries}`;

  return {
    title: 'Code Review Summary',
    content,
    summary: '',
    reviews: results,
  };
}

export async function runCRGPT(
  options: runCRGPTOptions,
  config: Config
): Promise<ReviewSumary> {
  const { sourceBranch, targetBranch, prId } = options;
  console.log(`run CRGPT`)
  console.log(`sourceBranch: ${sourceBranch}`);
  console.log(`targetBranch: ${targetBranch}`);
  if (!sourceBranch || !targetBranch) {
    throw new Error(
      'Error: Please provide sourceBranch, targetBranch as command line arguments.'
    );
  }

  const diffData = await generateDiffs(sourceBranch, targetBranch, config);
  const results = await processDiffs(diffData, config, prId);
  const commentContent = await summarizeCRContent(results, config);
  return commentContent;
}

export async function runCRGPTCLI(
  options: runCRGPTOptions,
  config: Config
): Promise<void> {
  const { prId } = options;
  const commentContent = await runCRGPT(options, config);

  if (config.output =='bitbucket' && config.bitbucket && prId) {
    await postCommentToBitbucketPR(commentContent, config.bitbucket, prId);
  } else if (config.output =='github' && config.github && prId) {
    await postCommentToGithubPR(commentContent, config.github, prId);
  } else if (config.output =='file' && config.file) {
    await writeCodeReviewToFile(commentContent, config.file);
  } else {
    printCodeReviewToConsole(commentContent);
  }
}
