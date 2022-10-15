import { HttpClient } from "@actions/http-client";
import { BasicCredentialHandler } from "@actions/http-client/lib/auth";

export class JiraKey {
  constructor(public projectKey: string, public number: string) {}

  toString(): string {
    return `${this.projectKey}-${this.number}`;
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

  async getIssueType(key: JiraKey): Promise<string | undefined> {
    try {
      const res = await this.client.get(
        `${this.baseUrl}/issue/${key}?fields=issuetype`
      );
      const body: string = await res.readBody();
      console.log(body);
      const obj = JSON.parse(body);
      return obj.fields.issuetype.name?.toLowerCase();
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }
}
