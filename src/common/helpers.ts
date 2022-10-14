import * as github from "@actions/github";
import * as core from "@actions/core";
import * as common from "./common";

import type { GithubLabel, GithubReviewer } from "./common";

export async function fetchContent(
  client: common.ClientType,
  repoPath: string
): Promise<string> {
  const response: any = await client.rest.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: repoPath,
    ref: github.context.sha,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

export async function getPrNumber(
  client: common.ClientType
): Promise<number | undefined> {
  try {
    const pullRequest = github.context.payload.pull_request;
    if (pullRequest) {
      return pullRequest.number;
    }

    const result = await client.rest.repos.listPullRequestsAssociatedWithCommit(
      {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        commit_sha: github.context.sha,
      }
    );

    const pr = result.data
      .filter((el) => el.state === "open")
      .find((el) => {
        return github.context.payload.ref === `refs/heads/${el.head.ref}`;
      });

    if (pr !== undefined) {
      core.info(`📄 Linked PR: ${pr.number} | ${pr.title}`);
    }

    return pr?.number;
  } catch (error: any) {
    core.error(`🚨 Failed to get PR number: ${error}`);
    return undefined;
  }
}

export async function getChangedFiles(
  client: common.ClientType,
  prNumber: number
): Promise<string[]> {
  const listFilesOptions = client.rest.pulls.listFiles.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const listFilesResponse = await client.paginate(listFilesOptions);
  const changedFiles = listFilesResponse.map((f: any) => f.filename);

  // TODO: loop when more than 30 files changed

  if (changedFiles.length > 0) {
    core.info("📄 Changed files");
    for (const file of changedFiles) {
      core.info(`  📄 Changed file: ${file}`);
    }
  }

  return changedFiles;
}

export async function getPrReviewersAndAssignees(
  client: common.ClientType,
  prNumber: number
): Promise<common.PullRequestDetails | undefined> {
  try {
    const pullRequest = await client.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
    });

    const labels = pullRequest.data.labels as GithubLabel[];
    const reviewers = pullRequest.data.requested_reviewers as GithubReviewer[];

    return {
      prNumber: prNumber,
      labels: labels.map((label) => label.name),
      reviewers: reviewers.map((reviewer) => reviewer.login),
      baseSha: pullRequest.data.base?.sha,
      owner: pullRequest.data.user?.login,
    };
  } catch (error: any) {
    core.error(`🚨 Failed to get PR details: ${error}`);
    return undefined;
  }
}
