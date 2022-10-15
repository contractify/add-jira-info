import { HttpClient } from "@actions/http-client";
import { BasicCredentialHandler } from "@actions/http-client/lib/auth";

export class JiraKey {
  constructor(public project: string, public number: string) {}

  toString(): string {
    return `${this.project}-${this.number}`;
  }
}

export class JiraIssue {
  constructor(
    public key: JiraKey,
    public title: string | undefined,
    public type: string | undefined
  ) {}

  toString(): string {
    return `${this.key} | ${this.type} | ${this.title}`;
  }
}

export class JiraClient {
  client: HttpClient;

  constructor(
    private baseUrl: string,
    private username: string,
    private token: string,
    private projectKey: string
  ) {
    const credentials = new BasicCredentialHandler(this.username, this.token);

    this.client = new HttpClient("add-jira-info-action", [credentials], {
      socketTimeout: 2000,
    });
  }

  extractJiraKey(input: string): JiraKey | undefined {
    const regex = new RegExp(`${this.projectKey}-(?<number>\\d+)`, "i");
    const match = input.match(regex);

    if (!match?.groups?.number) {
      return undefined;
    }

    return new JiraKey(this.projectKey, match?.groups?.number);
  }

  async getIssue(key: JiraKey): Promise<JiraIssue | undefined> {
    try {
      const res = await this.client.get(
        this.getRestApiUrl(`issue/${key}?fields=issuetype,summary`)
      );
      const body: string = await res.readBody();
      const obj = JSON.parse(body);

      var issuetype: string | undefined = undefined;
      var title: string | undefined = undefined;
      for (let key in obj.fields) {
        if (key === "issuetype") {
          issuetype = obj.fields[key].name?.toLowerCase();
        }
        if (key === "summary") {
          title = obj.fields[key];
        }
      }

      return new JiraIssue(key, title, issuetype);
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }

  private getRestApiUrl(endpoint: string): string {
    return `${this.baseUrl}/rest/api/3/${endpoint}`;
  }
}
