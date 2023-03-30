import { ReviewSumary } from './types';

export async function printCodeReviewToConsole(
  result: ReviewSumary
): Promise<any> {
  const commentContent = result.content;

  return new Promise((resolve) => {
    console.log(`Code review comment`);
    console.log(commentContent);
  });
}
