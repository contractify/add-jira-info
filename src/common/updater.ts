import { JiraIssue } from "./jira_client";

const ISSUE_TYPE_EMOJI: Record<string, string> = {
  bug: "🐛",
  story: "📖",
  task: "✅",
  epic: "🚀",
  subtask: "🔧",
  improvement: "💡",
  feature: "✨",
  spike: "🔍",
};

function issueTypeEmoji(type: string | undefined): string {
  if (!type) return "";
  const emoji = ISSUE_TYPE_EMOJI[type.toLowerCase()];
  return emoji ? `${emoji} ` : "";
}

export class Updater {
  constructor(
    private jiraIssue: JiraIssue,
    private addIssueTypeEmoji: boolean = true,
  ) {}

  title(title: string): string {
    const emoji = this.addIssueTypeEmoji
      ? issueTypeEmoji(this.jiraIssue.type)
      : "";
    if (title.startsWith(`${emoji}${this.jiraIssue.key} | `)) {
      return title;
    }

    const patternsToStrip = [
      `^\\P{L}*${this.jiraIssue.key.project} ${this.jiraIssue.key.number}`,
      `^\\P{L}*${this.jiraIssue.key.project}-${this.jiraIssue.key.number}`,
      `${this.jiraIssue.key}$`,
    ];

    for (const pattern of patternsToStrip) {
      const regex = new RegExp(`${pattern}`, "iu");
      title = title.replace(regex, "").trim();
      title = title.replace(/^\|+/, "").trim();
      title = title.replace(/\|+$/, "").trim();
    }

    return `${emoji}${this.jiraIssue.key} | ${title}`;
  }

  body(body: string | undefined): string | undefined {
    if (body) {
      const partialKeyRegex = new RegExp(
        `${this.jiraIssue.key.project}-(?=\\n|$)`,
        "gi",
      );
      body = body.replace(partialKeyRegex, `${this.jiraIssue.key}`);
    }

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

  addFixVersionsToBody(body: string | undefined): string | undefined {
    const { fixVersions } = this.jiraIssue;

    if (!fixVersions?.length) {
      return body;
    }

    if (!body) {
      body = "";
    }

    if (body.includes("**Fix versions**:")) {
      body = body.replace(
        /\*\*Fix versions\*\*:.*$/,
        `**Fix versions**: ${fixVersions.join(",")}`,
      );
    } else {
      body = `${body}\n\n**Fix versions**: ${fixVersions.join(",")}`.trim();
    }

    return body;
  }
}
