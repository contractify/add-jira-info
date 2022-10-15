import * as github from "@actions/github";
import * as core from "@actions/core";

export type GithubClientType = ReturnType<typeof github.getOctokit>;

type GithubPullRequest = {
  number: number | undefined;
  title: string | undefined;
};

export class GithubClient {
  client: GithubClientType;
  owner: string;
  repo: string;

  constructor(private token: string) {
    this.client = github.getOctokit(this.token);
    this.owner = github.context.repo.owner;
    this.repo = github.context.repo.repo;
  }

  getBranchName(): string {
    return (
      github.context.payload.pull_request?.head.ref || github.context.ref
    ).replace("refs/heads/", "");
  }

  async getPullRequest(): Promise<GithubPullRequest | undefined> {
    try {
      if (github.context.payload.pull_request?.number) {
        return this.getPullRequestByNumber(
          github.context.payload.pull_request?.number
        );
      }
      return this.getPullRequestAssociatedWithCommit(github.context.sha);
    } catch (error: any) {
      core.error(`🚨 Failed to get pull request: ${error}`);
      return undefined;
    }
  }

  async createLabelIfNotExists(
    label: string,
    description: string = "",
    color: string = "FBCA04"
  ): Promise<void> {
    try {
      await this.client.rest.issues.createLabel({
        owner: this.owner,
        repo: this.repo,
        name: label,
        description: description,
        color: color,
      });
    } catch (error: any) {
      core.error(`🚨 Failed to create label: ${error}`);
      throw error;
    }
  }

  async addLabelsToIssue(issue: number, labels: string[]): Promise<void> {
    try {
      await this.client.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issue,
        labels: labels,
      });
    } catch (error: any) {
      core.error(`🚨 Failed to add labels to issue: ${error}`);
      throw error;
    }
  }

  private async getPullRequestByNumber(
    number: number
  ): Promise<GithubPullRequest | undefined> {
    const response = await this.client.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: number,
    });

    return {
      number: response.data.number,
      title: response.data.title,
    };
  }

  private async getPullRequestAssociatedWithCommit(
    sha: string
  ): Promise<GithubPullRequest> {
    const response =
      await this.client.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: sha,
      });

    const pullRequest = response.data
      .filter((el) => el.state === "open")
      .find((el) => {
        return github.context.payload.ref === `refs/heads/${el.head.ref}`;
      });

    return {
      number: pullRequest?.number,
      title: pullRequest?.title,
    };
  }

  // private async fetchContent(repoPath: string): Promise<string> {
  //   const response: any = await this.client.rest.repos.getContent({
  //     owner: this.owner,
  //     repo: this.repo,
  //     path: repoPath,
  //     ref: github.context.sha,
  //   });

  //   return Buffer.from(
  //     response.data.content,
  //     response.data.encoding
  //   ).toString();
  // }
}
