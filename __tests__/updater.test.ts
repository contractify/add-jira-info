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
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });

  it("fixes the jira number if present incorrect case", () => {
    const title = "Prj 1234 protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the jira number if present case correct case", () => {
    const title = "PRJ 1234 protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the jira number if present incorrect case with pipe symbol", () => {
    const title = "Prj 1234 | protect web app with a login screen";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | protect web app with a login screen");
  });

  it("fixes the missing pipe symbol", () => {
    const title = "PRJ-1234 My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });

  it("does nothing when the jira number is already present", () => {
    const title = "PRJ-1234 | My pull request title";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });

  it("updates if the jira key is at the end of the title", () => {
    const title = "My pull request title | PRJ-1234";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | My pull request title");
  });

  it("does not replace the key in the middle of the title", () => {
    const title = "PRJ-1234 | My pull request PRJ-1234 title";

    const actual = updater.title(title);
    expect(actual).toBe("PRJ-1234 | My pull request PRJ-1234 title");
  });
});

describe("body", () => {
  let updater: Updater;

  beforeEach(() => {
    const jiraKey = new JiraKey("PRJ", "1234");
    const jiraIssue = new JiraIssue(jiraKey, "http://jira", "title", "story");
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

  it("adds the key to an existing body with suffix", () => {
    const body = "test\n\nPRJ-";

    const actual = updater.body(body);
    expect(actual).toBe("test\n\n[**PRJ-1234** | title](http://jira)");
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
});
