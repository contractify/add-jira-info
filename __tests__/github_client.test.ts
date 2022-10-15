import { GithubClient } from "../src/common/github_client";

describe("basics", () => {
  it("constructs", () => {
    const client = new GithubClient("token");
    expect(client).toBeDefined();
  });
});

describe("extract jira key", () => {
  let client: GithubClient;

  beforeEach(() => {
    client = new GithubClient("token");
  });

  it("gets the pr branch name from the context", () => {
    const branchName = client.getBranchName();
    expect(branchName).toBe("feature/123-sample-feature");
  });

  it("gets a pull request", async () => {
    const pullRequest = await client.getPullRequest();
    expect(pullRequest).toBeDefined();
    expect(pullRequest?.number).toBe(123);
    expect(pullRequest?.title).toBe("pr title");
  });
});
