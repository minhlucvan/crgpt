import fetch from "node-fetch";
import { parseStringTemplate } from "../utils/strings";
import { getCurrentCommitId } from "./git";
import { Config, FileReviewResult, ReviewSumary } from "./types";

export async function postCommentToGithubPR(
  result: ReviewSumary,
  config: Config,
  prId: string
): Promise<any> {
  if (!config.github) {
    throw new Error(`GitHub configuration is not provided`);
  }

  const { repoSlug, projectSlug } = config.code;
  const { endpoint, accessToken } = config.github;

  if (!accessToken) {
    throw new Error(`GitHub access token is not provided`);
  }

  const apiEndpoint =
    endpoint ||
    "https://api.github.com/repos/${projectSlug}/${repoSlug}/pulls/${prId}/comments";
  const apiUrl = parseStringTemplate(apiEndpoint, { projectSlug, repoSlug, prId });
  const commitId = await getCurrentCommitId();
  for (const fileReview of result.reviews) {
    await postCommentToGithubPRFile(fileReview, apiUrl, commitId, accessToken);
  }
  console.log(`Posted ${result.reviews.length} comments to GitHub PR`);
}

export async function postCommentToGithubPRFile(
  fileReview: FileReviewResult,
  apiUrl: string,
  commitId: string,
  accessToken: string,
): Promise<any> {

  const bodyData = {
    body: fileReview.review,
    commit_id: commitId,
    path: fileReview.file,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
