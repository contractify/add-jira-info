import * as github from "@actions/github";
import * as core from "@actions/core";

export type GithubClientType = ReturnType<typeof github.getOctokit>;

class GithubPullRequest {
  constructor(public number: number, public title: string) {}

  toString(): string {
    return `${this.number} | ${this.title}`;
  }
}

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

  async createLabel(
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
      if (error.response?.code === "already_exists") {
        return;
      }
      this.throwError(error);
    }
  }

  async labelExists(label: string): Promise<boolean> {
    try {
      await this.client.rest.issues.getLabel({
        owner: this.owner,
        repo: this.repo,
        name: label,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      this.throwError(error);
    }
    return true;
  }

  async addLabelsToIssue(
    pullRequest: GithubPullRequest,
    labels: string[]
  ): Promise<void> {
    try {
      await this.client.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: pullRequest.number,
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
    try {
      const response = await this.client.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: number,
      });

      return {
        number: response.data.number,
        title: response.data.title,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      this.throwError(error);
    }
  }

  private async getPullRequestAssociatedWithCommit(
    sha: string
  ): Promise<GithubPullRequest | undefined> {
    try {
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

      if (!pullRequest) {
        return undefined;
      }

      return new GithubPullRequest(pullRequest.number, pullRequest.title);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return undefined;
      }
      this.throwError(error);
    }
  }

  private throwError(error: any) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response));
    }
    throw error;
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
