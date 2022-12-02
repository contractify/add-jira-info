import { JiraIssue } from "./jira_client";

export class Updater {
  constructor(private jiraIssue: JiraIssue) {}

  title(title: string): string {
    if (title.startsWith(`${this.jiraIssue.key} | `)) {
      return title;
    }

    const patternsToStrip = [
      `^${this.jiraIssue.key.project} ${this.jiraIssue.key.number}`,
      `^${this.jiraIssue.key.project}-${this.jiraIssue.key.number}`,
      `${this.jiraIssue.key}$`,
    ];

    for (const pattern of patternsToStrip) {
      const regex = new RegExp(`${pattern}`, "i");
      title = title.replace(regex, "").trim();
      title = title.replace(/^\|+/, "").trim();
      title = title.replace(/\|+$/, "").trim();
    }

    return `${this.jiraIssue.key} | ${title}`;
  }

  body(body: string | undefined): string | undefined {
    if (
      body?.includes(`${this.jiraIssue.key}`) &&
      !body?.includes(`References ${this.jiraIssue.key}`)
    ) {
      return body;
    }

    if (!body) {
      body = "";
    }

    const patternsToStrip = [
      `References ${this.jiraIssue.key}$`,
      `References ${this.jiraIssue.key.project}-$`,
      `${this.jiraIssue.key.project}-$`,
      `${this.jiraIssue.key}$`,
    ];

    for (const pattern of patternsToStrip) {
      const regex = new RegExp(`${pattern}`, "i");
      body = body.replace(regex, "").trim();
    }

    return `${body}\n\n[**${this.jiraIssue.key}** | ${this.jiraIssue.title}](${this.jiraIssue.link})`.trim();
  }
}
