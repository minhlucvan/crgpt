# CRGPT - CODE REVIEW :heart: CHATGPT

CRGPT is a command-line interface tool that uses ChatGPT API to analyze the git diff and provide insights about the pull request, find potential issues, summarize the changes, and create customizable prompts, code review checklists, and comments into GitHub, Bitbucket, or a markdown file.

## Installation

To use CRGPT, you must have Node.js installed on your system. Then, you can install CRGPT using NPM with the following command:

```bash
npm install -g crgpt
```

## Usage

To run *CRGPT* you can execute the `crgpt` command with the following arguments:

```bash
crgpt [action] [options]
```

Where action is one of the following options:

- `init`: create the `.crgpt.yml` configuration file
- `review`: perform a code review

And options are the command-line arguments:

- `-o, --output <output>`: Specify the output method.
- `-s, --source <source>`: Specify the source branch name.
- `-t, --target <target>`: Specify the target branch name.
- `-d, --diff-args [diffArgs]`: Specify Git diff arguments.
- `-p, --prId [prId]`: Specify the pull request ID.
- `-m, --model [model]`, Openai model (default is "gpt-3.5-turbo")
- `-co, --commit [commitId]`, Commit ID
- `-ps, --project-slug [projectSlug]`: Specify the Bitbucket project slug.
- `-rs, --repo-slug [repoSlug]`: Specify the Bitbucket repo slug.
- `-at, --ai-token [accessToken]`: Specify the OpenAI access token.
- `-gt, --github-token [accessToken]`: Specify the GitHub access token.
- `-bt, --bitbucket-token [accessToken]`: Specify the Bitbucket access token.
- `-c, --config [config]`: Specify the path to the configuration file (default is ".crgpt.yml").

For example, to perform a code review on a pull request with ID 123, you can use the following command:

```bash
crgpt -s sourceBranch -t targetBranch -p 123 -at openaiToken -bt bitbucketToken review

```

To perform a code review the changes between 2 branches and print to console:

```bash
crgpt -s sourceBranch -t targetBranch -at openaiToken review

```

## Configuration

CRGPT can be configured using a YAML configuration file named .crgpt.yml. The configuration file allows you to customize the prompts, code review checklist, and comments for each platform (GitHub, Bitbucket, and file).

The following is an example of the configuration file:

```yml
# .crgpt.yml

output: console
openai:
  endpoint: https://api.openai.com/v1/chat/completions
  apiKey: ''
review:
  prompt: >-
    Your task is to act as a code reviewer and review a pull request. Your
    output should focus on items mentioned in the given code review checklist.
    You need to summarize the changes made, identify potential issues related to
    logic and runtime, check that is the pull request is good to merge or not.

    Instructions:
    - Review the output of git diff for the pull request 
    - Summarize the overview of the changes made in a bullet list
    - Identify potential issues related to logic and runtime in a bullet list
    - Output as a markdown document, with the following structure:
        {output}
    - The response sentences are no longer than 16 words each
    - Make sure that when there are no issues, there is no need to output the
    Issues section
    - Remember to keep the response sentences short, no longer than 16 words each:
    - Keep the response document as short as possible
    - Focus on items mentioned in the following code review checklist:
        {checklist}
  checklist: |-
      + Review for unnecessary files, folders, or code modules.
      + Verify adherence to Single Responsibility Principle (SRP) and Don't Repeat Yourself (DRY) principle.
      + Ensure all error scenarios are covered in the code.
      + Check for clear and helpful error messages.
      + Review for graceful error handling.
      + Verify secure storage of sensitive data and credentials.
      + Check external libraries and packages are up-to-date.
      + Ensure protection against common security vulnerabilities such as SQL injection and XSS.
  summary: |-
    #### Changes:
    - summarize the overview of the changes has made
    #### Issues:    
    - Identify potential issues related to logic and runtime.
    - issues mentioned in the code review checklist

    **Mergeable:** YES, NO or NEEDS IMPROVEMENT
  ignoreFiles: []


```

In the configuration file, you can customize the following parameters:

- openai: the endpoint and API key for the OpenAI API
- review: the prompt and checklist for the code review
- github: the GitHub access token, owner, and repository for posting the code review comment
- bitbucket: the Bitbucket access token, owner, and repository for posting the code review comment
- file: the path of the markdown file to write the code review

## Contributing

If you want to contribute to CRGPT, please fork the repository, make your changes, and create a pull request.

Author: [@minhlucvam](https://github.com/minhlucvan)

Special thanks to our contributors: 

## License
CRGPT is released under the MIT License. See the [LICENSE](./LICENSE) file for details.


