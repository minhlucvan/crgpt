import fetch from 'node-fetch';
import { parseStringTemplate } from '../utils/strings';
import { Config, ReviewSumary } from './types';

export async function postCommentToBitbucketPR(
    result: ReviewSumary,
    config: Config,
    prId: string
  ): Promise<any> {
    if (!config.bitbucket) {
      throw new Error(`Bitbucket configuration is not provided`);
    }

    console.log(`Posting comment to Bitbucket PR: ${prId}`);
  
    const { accessToken, endpoint } = config.bitbucket;
    const { repoSlug, projectSlug } = config.code;
    const apiEndpoint = endpoint || 'https://api.bitbucket.org/2.0/repositories/${owner}/${repoSlug}/pullrequests/${prId}/comments'
    const apiUrl = parseStringTemplate(apiEndpoint, {
      owner: projectSlug,
      repoSlug,
      prId,
    });
    
    const commentContent = result.content;
    const bodyData = {
      content: {
        raw: commentContent,
      },
    };
  
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });
  
    if (!response.ok) {
      console.error(`Error posting comment to Bitbucket PR: ${response.statusText}`);
      throw new Error(
        `Error posting comment to Bitbucket PR: ${response.statusText}`
      );
    }

    console.log(`Comment posted to Bitbucket PR: ${response.statusText}`);
  
    return await response.json();
  }
  