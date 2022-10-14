import axios, { AxiosInstance } from "axios";

export class Client {
  client: AxiosInstance;

  constructor(private jiraToken: string, private jiraBaseUrl: string) {
    const encodedToken = Buffer.from(this.jiraToken).toString("base64");

    this.client = axios.create({
      baseURL: `${this.jiraBaseUrl}/rest/api/3`,
      timeout: 2000,
      headers: { Authorization: `Basic ${encodedToken}` },
    });
  }

  async getIssueTypes(): Promise<string[]> {
    try {
      const result = await this.client.get("/issuetype");
      return result.data.map((item) => item.name);
      // const issue: JIRA.Issue = await this.getIssue(key);
      // const {
      //   fields: { issuetype: type, project, summary },
      // } = issue;
      // return {
      //   key,
      //   summary,
      //   url: `${this.jiraBaseUrl}/browse/${key}`,
      //   type: {
      //     name: type.name,
      //     icon: type.iconUrl,
      //   },
      //   project: {
      //     name: project.name,
      //     url: `${this.jiraBaseUrl}/browse/${project.key}`,
      //     key: project.key,
      //   },
      // };
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
    return [];
  }

  // async getIssue(id: string): Promise<JIRA.Issue> {
  //   const url = `/issue/${id}?fields=project,summary,issuetype`;
  //   const response = await this.client.get<JIRA.Issue>(url);
  //   return response.data;
  // }
}
