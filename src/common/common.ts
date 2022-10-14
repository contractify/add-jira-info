import * as github from "@actions/github";

export type ClientType = ReturnType<typeof github.getOctokit>;

export type PullRequestDetails = {
  prNumber: number;
  labels: string[];
  reviewers: string[];
  baseSha: string;
  owner: string | undefined;
};

export interface GithubLabel {
  name: string;
}

export interface GithubReviewer {
  login: string;
}
