export interface CrGPTCLIOptions {
    source?: string;
    target?: string;
    prId?: string;
    init?: boolean;
    aiToken?: string;
    githubToken?: string;
    bitbucketToken?: string;
    projectSlug?: string;
    repoSlug?: string;
    config: string;
    output?: 'console' | 'bitbucket' | 'github' | 'file';
  }
  