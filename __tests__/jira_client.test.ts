import { JiraClient, JiraKey } from "../src/common/jira_client";
import nock from "nock";

describe("basics", () => {
  it("constructs", () => {
    const client = new JiraClient("base-url", "username", "token", "PRJ");
    expect(client).toBeDefined();
  });
});

describe("get jira issue type", () => {
  let client: JiraClient;

  beforeEach(() => {
    client = new JiraClient("https://base-url", "username", "token", "PRJ");
  });

  it("gets the issue type of a jira issue", async () => {
    const response = {
      fields: {
        issuetype: {
          name: "Story",
        },
        summary: "My Issue",
      },
    };

    nock("https://base-url")
      .get("/rest/api/3/issue/PRJ-123?fields=issuetype,summary")
      .reply(200, () => response);

    const issue = await client.getIssue(new JiraKey("PRJ", "123"));
    expect(issue?.type).toBe("story");
  });
});

describe("extract jira key", () => {
  let client: JiraClient;

  beforeEach(() => {
    client = new JiraClient("base-url", "username", "token", "PRJ");
  });

  it("extracts the jira key if present", () => {
    const jiraKey = client.extractJiraKey(
      "PRJ-3721_actions-workflow-improvements"
    );
    expect(jiraKey?.toString()).toBe("PRJ-3721");
  });

  it("extracts the jira key from a feature branch if present", () => {
    const jiraKey = client.extractJiraKey(
      "feature/PRJ-3721_actions-workflow-improvements"
    );
    expect(jiraKey?.toString()).toBe("PRJ-3721");
  });

  it("extracts the jira key case insensitive", () => {
    const jiraKey = client.extractJiraKey(
      "PRJ-3721_actions-workflow-improvements"
    );
    expect(jiraKey?.toString()).toBe("PRJ-3721");
  });

  it("returns undefined if not present", () => {
    const jiraKey = client.extractJiraKey(
      "prj3721_actions-workflow-improvements"
    );
    expect(jiraKey).toBeUndefined();
  });
});
