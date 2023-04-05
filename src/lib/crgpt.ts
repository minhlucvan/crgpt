
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
import { generateDiffs } from './git';


async function postDiffToEndpoint(
  diffData: string,
  config: Config
): Promise<string> {
  if (!config.openai) {
    throw new Error('Error: OpenAI config not found');
  }

  const endpointUrl = config.openai.endpoint;
  const apiKey = config.openai.apiKey;
  const promptTml = config.review.prompt;
  const checklist = config.review.checklist;
  const summary = config.review.summary;
  const prompt = promptTml.replace('{checklist}', checklist).replace('{output}', summary);

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.openai.model || 'gpt-3.5-turbo',
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
  const results: FileReviewResult[] = [];

  for (const { file, diff } of diffData) {
    console.log(`Processing file: ${file}`);
    try {
      const review = await processDiff(diff, config);
      results.push({ file, review });
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to process file ${file}: ${error}`);
      results.push({ file, review: `Couldn\'t process review ${error}` });
    }
  }

  return results;
}

async function processDiff(diff: string, config: Config): Promise<string> {
  try {
    const result = await postDiffToEndpoint(diff, config);
    return result as string;
  } catch (error) {
    throw new Error(`Failed to post diff to endpoint: ${error}`);
  }
}


async function summarizeCRContent(
  results: FileReviewResult[],
  config: Config
): Promise<ReviewSumary> {
  const header = '# Code Review Summary:';
  const fileSummaries = results
    .map(({ file, review }) => `### ${file}\n  \n${review}`)
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

  if (config.output == 'bitbucket' && config.bitbucket && prId) {
    await postCommentToBitbucketPR(commentContent, config, prId);
  } else if (config.output == 'github' && config.github && prId) {
    await postCommentToGithubPR(commentContent, config, prId);
  } else if (config.output == 'file' && config.file) {
    await writeCodeReviewToFile(commentContent, config);
  } else {
    printCodeReviewToConsole(commentContent);
  }
}
