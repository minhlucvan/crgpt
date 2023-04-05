import fetch from "node-fetch";
import { parseStringTemplate } from "../utils/strings";
import { getCurrentCommitId } from "./git";
import { Config, FileReviewResult, ReviewSumary } from "./types";

export async function postCommentToGithubPR(
  result: ReviewSumary,
  githubConfig: Config["github"],
  prId: string
): Promise<any> {
  if (!githubConfig) {
    throw new Error(`GitHub configuration is not provided`);
  }

  const { repoSlug, owner } = githubConfig;
  const apiEndpoint =
    githubConfig.endpoint ||
    "https://api.github.com/repos/${owner}/${repoSlug}/pulls/${prId}/comments";
  const apiUrl = parseStringTemplate(apiEndpoint, { owner, repoSlug, prId });
  const commitId = githubConfig.commitId || await getCurrentCommitId();
  for (const fileReview of result.reviews) {
    await postCommentToGithubPRFile(fileReview, apiUrl, commitId, githubConfig);
  }
  console.log(`Posted ${result.reviews.length} comments to GitHub PR`);
}

export async function postCommentToGithubPRFile(
  fileReview: FileReviewResult,
  apiUrl: string,
  commitId: string,
  githubConfig: Config["github"],
): Promise<any> {
  if (!githubConfig) {
    throw new Error(`GitHub configuration is not provided`);
  }

  const bodyData = {
    body: fileReview.review,
    commit_id: commitId,
    path: fileReview.file,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubConfig.accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
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
