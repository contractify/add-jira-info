import { JiraIssue, JiraKey } from "../src/common/jira_client";
import { Updater } from "../src/common/updater";

describe("title", () => {
  let updater: Updater;

  beforeEach(() => {
    const jiraKey = new JiraKey("PRJ", "1234");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", "story");
    updater = new Updater(jiraIssue);
  });

  it("adds the jira number to the title if not present", () => {
    const title = "My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request title");
  });

  it("fixes the jira number if present incorrect case", () => {
    const title = "Prj 1234 protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the jira number if present case correct case", () => {
    const title = "PRJ 1234 protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the jira number if present incorrect case with pipe symbol", () => {
    const title = "Prj 1234 | protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the missing pipe symbol", () => {
    const title = "PRJ-1234 My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request title");
  });

  it("does nothing when the jira number and emoji are already present", () => {
    const title = "📖 PRJ-1234 | My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request title");
  });

  it("adds the emoji when only the jira number is present without emoji", () => {
    const title = "PRJ-1234 | My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request title");
  });

  it("updates if the jira key is at the end of the title", () => {
    const title = "My pull request title | PRJ-1234";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request title");
  });

  it("does not replace the key in the middle of the title", () => {
    const title = "PRJ-1234 | My pull request PRJ-1234 title";

    const actual = updater.title(title);
    expect(actual).toBe("📖 PRJ-1234 | My pull request PRJ-1234 title");
  });

  it("adds no emoji for unknown issue types", () => {
    const jiraKey = new JiraKey("PRJ", "1234");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", "unknown");
    const updaterUnknown = new Updater(jiraIssue);

    const actual = updaterUnknown.title("My pull request title");
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });

  it("adds no emoji when issue type is undefined", () => {
    const jiraKey = new JiraKey("PRJ", "1234");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", undefined);
    const updaterNoType = new Updater(jiraIssue);

    const actual = updaterNoType.title("My pull request title");
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });
});

describe("body", () => {
  let updater: Updater;

  beforeEach(() => {
    const jiraKey = new JiraKey("PRJ", "1234");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", "story", [
      "v1.0.0",
    ]);
    updater = new Updater(jiraIssue);
  });

  it("adds the key to an undefined body", () => {
    const body = undefined;

    const actual = updater.body(body);
    expect(actual).toBe("[**PRJ-1234** | title](http://jira)");
  });

  it("adds the key to an empty body", () => {
    const body = "";

    const actual = updater.body(body);
    expect(actual).toBe("[**PRJ-1234** | title](http://jira)");
  });

  it("adds the key to an existing body", () => {
    const body = "test";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\n[**PRJ-1234** | title](http://jira)");
  });

  it("replaces a partial key (project key + dash) at end of body with the full key", () => {
    const body = "test\n\nPRJ-";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\nPRJ-1234");
  });

  it("adds the key to an existing body with reference to ticket", () => {
    const body = "test\n\nReferences PRJ-1234";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\n[**PRJ-1234** | title](http://jira)");
  });

  it("adds the key to an existing body with suffix", () => {
    const body = "test\n\nReferences PRJ-";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\n[**PRJ-1234** | title](http://jira)");
  });

  it("does nothing if the body contains the key already", () => {
    const body = "PRJ-1234\n\ntest";

    const actual = updater.body(body);
    expect(actual).toBe("PRJ-1234\n\ntest");
  });

  it("replaces a partial key followed by a newline with the full key", () => {
    const body = "Implements PRJ-\nSome more text";

    const actual = updater.body(body);
    expect(actual).toBe("Implements PRJ-1234\nSome more text");
  });

  it("replaces multiple partial keys followed by newlines with the full key", () => {
    const body = "See PRJ-\nAnd also PRJ-\nDone";

    const actual = updater.body(body);
    expect(actual).toBe("See PRJ-1234\nAnd also PRJ-1234\nDone");
  });

  it("replaces a partial key at the end of the body (no trailing newline)", () => {
    const body = "test\n\nPRJ-";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\nPRJ-1234");
  });

  it("replaces a partial key followed by a Windows-style newline (\\r\\n) with the full key", () => {
    const body = "Implements PRJ-\r\nSome more text";

    const actual = updater.body(body);
    expect(actual).toBe("Implements PRJ-1234\r\nSome more text");
  });

  it("replaces multiple partial keys followed by Windows-style newlines with the full key", () => {
    const body = "See PRJ-\r\nAnd also PRJ-\r\nBut also PRJ-\nDone";

    const actual = updater.body(body);
    expect(actual).toBe("See PRJ-1234\r\nAnd also PRJ-1234\r\nBut also PRJ-1234\nDone");
  });

  it("replaces a partial key in a PR template with Windows-style newlines (CTR project)", () => {
    const jiraKey = new JiraKey("CTR", "5678");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", "story");
    const ctrUpdater = new Updater(jiraIssue);

    const body = "Some changes\r\n\r\nReferences CTR-";

    const actual = ctrUpdater.body(body);
    expect(actual).toBe(
      "Some changes\n\n[**CTR-5678** | title](http://jira)",
    );
  });

  it("adds the fixVersions to an undefined body", () => {
    const body = undefined;

    const actual = updater.addFixVersionsToBody(body);
    expect(actual).toBe("**Fix versions**: v1.0.0");
  });

  it("adds the fixVersions to an empty body", () => {
    const body = "";

    const actual = updater.addFixVersionsToBody(body);
    expect(actual).toBe("**Fix versions**: v1.0.0");
  });

  it("adds the fixVersions to an existing body", () => {
    const body = "test";

    const actual = updater.addFixVersionsToBody(body);
    expect(actual).toBe("test\n\n**Fix versions**: v1.0.0");
  });

  it("adds the fixVersions to an existing body with reference to ticket", () => {
    const body = "test\n\nReferences PRJ-1234";

    const actual = updater.addFixVersionsToBody(body);
    expect(actual).toBe(
      "test\n\nReferences PRJ-1234\n\n**Fix versions**: v1.0.0",
    );
  });

  it("update the fixVersions if the body contains the fixVersions already", () => {
    const body = "**Fix versions**: v0.9.9";

    const actual = updater.addFixVersionsToBody(body);
    expect(actual).toBe("**Fix versions**: v1.0.0");
  });
});
