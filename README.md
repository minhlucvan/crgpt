# CRGPT - CODE REVIEW :heart: GPT

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

- `-s, --source <source>`: the name of the source branch
- `-t, --target <target>`: the name of the target branch
- `-p, --prId [prId]`: the ID of the pull request
- `-at, --ai-token [accessToken]`: the OpenAI access token
- `-g`, --github-token [accessToken]`: the GitHub access token
- `-bt, --bitbucket-token [accessToken]`: the Bitbucket access token
- `-c, --config [config]`: the path of the configuration file (default is .crgpt.yml)

For example, to perform a code review on a pull request with ID 123, you can use the following command:

```bash
crgpt review -s sourceBranch -t targetBranch -p 123 -at openaiToken -gt githubToken -bt bitbucketToken

```

## Configuration

CRGPT can be configured using a YAML configuration file named .crgpt.yml. The configuration file allows you to customize the prompts, code review checklist, and comments for each platform (GitHub, Bitbucket, and file).

The following is an example of the configuration file:

```yml
# .crgpt.yml

openai:
  endpoint: https://api.openai.com/v1/messages
  apiKey: "your-openai-api-key"
review:
  prompt: "Please review the following changes:\n{checklist}"
  checklist: "- Code follows style guide\n- No console.logs\n- Proper variable naming\n- Comments are helpful"
github:
  token: "your-github-token"
  owner: "your-github-owner"
  repo: "your-github-repo"
bitbucket:
  token: "your-bitbucket-token"
  owner: "your-bitbucket-owner"
  repo: "your-bitbucket-repo"
file:
  path: "./code-review.md"

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


