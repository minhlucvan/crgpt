export type Config = {
    output: 'console';
    bitbucket?: {
      repoSlug: string;
      accessToken: string;
      owner: string;
    };
    github?: {
      repoSlug: string;
      accessToken: string;
      owner: string;
    },
    file?: {
      path: string;
      name: string;
    },
    openai: {
      endpoint: string;
      apiKey: string;
    };
    review: {
      prompt: string;
      checklist: string;
      summary: string;
    };
  };

  export type ReviewSumary = {
    title: string;
    content: string;
    summary: string;
    reviews: FileReviewResult[];
  }
  
  export type Diff = {
    file: string;
    diff: string;
  };

  export type FileReviewResult = {
    file: string;
    review: string;
  }

  export type runCRGPTOptions = {
    sourceBranch: string;
    targetBranch: string;
    prId?: string;
  }