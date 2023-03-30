import fetch from 'node-fetch';
import { Config, ReviewSumary } from './types';

export async function postCommentToGithubPR(
  result: ReviewSumary,
  githubConfig: Config['github'],
  prId: string
): Promise<any> {
  if (!githubConfig) {
    throw new Error(`GitHub configuration is not provided`);
  }

  const { repoSlug, accessToken, owner } = githubConfig;
  const apiUrl = `https://api.github.com/repos/${owner}/${repoSlug}/issues/${prId}/comments`;
  const commentContent = result.content;
  const bodyData = {
    body: commentContent,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    throw new Error(
      `Error posting comment to GitHub PR: ${response.statusText}`
    );
  }

  return await response.json();
}
