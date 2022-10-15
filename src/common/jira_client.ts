import axios, { AxiosInstance } from "axios";

export class JiraKey {
  constructor(private projectKey: string, private number: string) {}

  toString(): string {
    return `${this.projectKey}-${this.number}`;
  }
}

export class JiraClient {
  client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private username: string,
    private token: string,
    private projectKey: string
  ) {
    const encodedToken = Buffer.from(`${this.username}:${this.token}`).toString(
      "base64"
    );

    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      timeout: 2000,
      headers: { Authorization: `Basic ${encodedToken}` },
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
      const response = await this.client.get(`/issue/${key}?fields=issuetype`);
      return response.data.fields.issuetype.name?.toLowerCase();
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }
}
