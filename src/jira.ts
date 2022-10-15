import axios, { AxiosInstance } from "axios";

export class Client {
  client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private username: string,
    private token: string
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

  async getIssueType(id: string): Promise<string | undefined> {
    try {
      const response = await this.client.get(`/issue/${id}?fields=issuetype`);
      return response.data.fields.issuetype.name?.toLowerCase();
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }
}
