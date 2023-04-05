import { exec } from 'child_process';
import { Config, Diff } from './types';

export async function generateDiffs(
    sourceBranch: string,
    targetBranch: string,
    config: Config
): Promise<Diff[]> {
    const command = `git diff ${sourceBranch}..${targetBranch} --name-only`;
    const ignoreFiles = config.review.ignoreFiles || [];

    const stdout = await execAsync(command);
    const files = stdout.trim().split("\n");
    const reviewableFiles = selectReviewableFiles(files, ignoreFiles);
    const diffs = [];

    for (const file of reviewableFiles) {
        const diff = await generateContentDiff(
            sourceBranch,
            targetBranch,
            file,
            config
        );
        diffs.push({ file, diff });
    }
    return diffs;
}

async function generateContentDiff(
    sourceBranch: string,
    targetBranch: string,
    file: string,
    config: Config
): Promise<string> {
    const diffArgs = config.code.gitDiffOArgs || "";
    const command = `git diff ${diffArgs} ${targetBranch}..${sourceBranch} -- "${file}"`;
    const stdout = await execAsync(command);

    return stdout;
}

function selectReviewableFiles(files: string[], ignoreFiles: string[]): string[] {
    return files.filter(file => {
        if (ignoreFiles.includes(file)) {
            return false;
        }
        // Add more conditions if required.
        return true;
    });
}

function execAsync(command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error: ${error.message}`));
            } else if (stderr) {
                reject(new Error(`Stderr: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

export function getCurrentCommitId(): Promise<string> {
    return execAsync("git rev-parse HEAD");
}