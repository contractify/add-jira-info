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

  async getProjectId(projectKey: string): Promise<number | undefined> {
    try {
      const result = await this.client.get(`/project/${projectKey}`);
      return result.data.id;
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }

  async getIssueTypesForProject(projectKey: string): Promise<string[]> {
    try {
      const projectId = await this.getProjectId(projectKey);

      const response = await this.client.get(
        `/issuetype/project?projectId=${projectId}`
      );
      return [
        ...new Set<string>(
          response.data
            .filter((item) => item.level !== 1)
            .map((item) => item.name)
        ),
      ];
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
  }

  async getIssueType(id: string): Promise<string | undefined> {
    try {
      const response = await this.client.get(`/issue/${id}?fields=issuetype`);
      console.log(response);
      return response.data.issuetype;
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }
}
