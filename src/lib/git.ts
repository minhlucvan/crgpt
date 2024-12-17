import { exec, ExecOptions } from "child_process";
import { minimatch } from 'minimatch'
import { Config, Diff } from "./types";

export async function generateDiffs(
    sourceBranch: string,
    targetBranch: string,
    config: Config
): Promise<Diff[]> {
    let command;
    // If targetBranch is HEAD, compare with the sourceBranch
    // useful uncommented code preview
    if (targetBranch === "HEAD") {
        command = `git diff ${sourceBranch} --name-only`;
    } else {
        command = `git diff ${targetBranch}...${sourceBranch} --name-only`;
    }
    const includes = config.review.includes || [];
    const excludes = config.review.excludes || [];
    const ignoreFiles = config.review.ignoreFiles || [];

    // Show deprecation warning
    if (ignoreFiles.length > 0) {
        console.warn(
            "[DEPRECATION] 'ignoreFiles' is deprecated. Please use 'includes' and 'excludes' instead."
        );

        // Convert ignoreFiles to excludes
        ignoreFiles.forEach(pattern => {
            if (!excludes.includes(pattern)) {
                excludes.push(pattern);
            }
        });
    }

    const stdout = await execAsync(command);
    const files = stdout.trim().split("\n");
    const reviewableFiles = selectReviewableFiles(files, includes, excludes, ignoreFiles);

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

export async function getCurrentBranch(): Promise<string> {
    const branch = await execAsync("git rev-parse --abbrev-ref HEAD");
    return branch.trim();
}

async function generateContentDiff(
    sourceBranch: string,
    targetBranch: string,
    file: string,
    config: Config
): Promise<string> {
    const diffArgs = config.code.gitDiffOArgs || "";
    let command;
    // If targetBranch is HEAD, compare with the sourceBranch
    // useful uncommented code preview
    if (targetBranch === "HEAD") {
        command = `git diff ${sourceBranch} ${diffArgs} -- ${file}`;
    } else {
        command = `git diff ${targetBranch}...${sourceBranch} ${diffArgs} -- ${file}`;
    }

    const stdout = await execAsync(command);

    return stdout;
}

function selectReviewableFiles(
    files: string[],
    includes: string[],
    excludes: string[],
    ignoreFiles: string[] // For backward compatibility
): string[] {
    // Prioritize includes and excludes
    return files.filter(file => {
        // Deprecated logic (ignoreFiles)
        if (ignoreFiles.some(pattern => minimatch(file, pattern))) {
            return false;
        }

        // Exclude files explicitly
        if (excludes.some(pattern => minimatch(file, pattern))) {
            console.log(`Excluding file explicitly: ${file}`);
            return false;
        }
        // Include only files matching the 'includes' patterns, if specified
        // If 'includes' is empty or contains '*', include all files
        if (includes.length > 0 && !includes.some(pattern => pattern === "*" || minimatch(file, pattern))) {
            console.log(`Excluding file: ${file}`);
            return false;
        }

        return true;
    });
}

function execAsync(command: string): Promise<string> {
    const options: ExecOptions = { maxBuffer: 1024 * 1024 * 10 }; // Increase maxBuffer to 10MB
    return new Promise<string>((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
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
