import { ReviewSumary } from './types';

export async function printCodeReviewToConsole(
  result: ReviewSumary
): Promise<any> {
  const commentContent = result.content;

  console.log('===================');
  console.log(commentContent);
  console.log('===================');
}
