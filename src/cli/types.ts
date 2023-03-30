export interface CrGPTCLIOptions {
    action: 'init' | 'review' | 'diff' | 'desc',
    source?: string;
    target?: string;
    prId?: string;
    init?: boolean;
    aiToken?: string;
    githubToken?: string;
    bitbucketToken?: string;
    config: string;
  }
  