import { HttpClient } from "@actions/http-client";
import { BasicCredentialHandler } from "@actions/http-client/lib/auth";
import * as core from "@actions/core";

export class JiraKey {
  constructor(
    public project: string,
    public number: string,
  ) {}

  toString(): string {
    return `${this.project}-${this.number}`;
  }
}

export class JiraIssue {
  constructor(
    public key: JiraKey,
    public link: string,
    public title: string | undefined,
    public type: string | undefined,
    public fixVersions?: string[],
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
    private projectKey: string,
  ) {
    const credentials = new BasicCredentialHandler(this.username, this.token);

    this.client = new HttpClient("add-jira-info-action", [credentials], {
      socketTimeout: 2000,
    });
  }

  async extractJiraKey(input: string): Promise<JiraKey | undefined> {

    // if project keys are not set, fetch it using current credentials
   if (!this.projectKey) {
      await this.getKeys()
    }

     /**
     * Allows for grabbing of multiple keys when given as the follwoing
     *  jira-project-key: |-
            foo
            bar
    * or 1 key if given only as
        jira-project-key: foo
    */
    const keys = this.projectKey
    .split(/[\r\n]/)
    .map(input => input.trim())
    .filter(input => input !== ''); // grab 1 or many project keys

    let matchingKey: JiraKey | undefined = undefined

    keys.forEach(projectKey => {
      const regex = new RegExp(`${projectKey}-(?<number>\\d+)`, "i");
      const match = input.match(regex);

      if (match?.groups?.number) {
        matchingKey = new JiraKey(projectKey, match?.groups?.number)
      }
    });


    return matchingKey

  }

  /**
   * Fetches all project keys from Jira for the current user
   * @returns undefined
   */
  async getKeys(): Promise<undefined> {

    try {
      const res = await this.client.get(
        this.getRestApiUrl(`/rest/api/3/project`),
      );

      const body: string = await res.readBody();
      const projects = JSON.parse(body);

      projects.map((project: { key: string }) => {
        this.projectKey += `${project.key}\r\n`; // added as string with \r\n to be split out to an array later
      });


    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }


  async getIssue(key: JiraKey): Promise<JiraIssue | undefined> {
    try {
      const res = await this.client.get(
        this.getRestApiUrl(`/rest/api/3/issue/${key}?fields=issuetype,summary,fixVersions`),
      );
      const body: string = await res.readBody();
      core.info(`Jira raw response: ${body}`);
      console.log(`Jira raw response: ${body}`);
      const obj = JSON.parse(body);

      var issuetype: string | undefined = undefined;
      var title: string | undefined = undefined;
      var fixVersions: string[] | undefined = undefined;
      for (let field in obj.fields) {
        if (field === "issuetype") {
          issuetype = obj.fields[field].name?.toLowerCase();
        } else if (field === "summary") {
          title = obj.fields[field];
        } else if (field === "fixVersions") {
          fixVersions = obj.fields[field]
            .map(({ name }) => name)
            .filter(Boolean);
        }
      }

      return new JiraIssue(
        key,
        `${this.baseUrl}/browse/${key}`,
        title,
        issuetype,
        fixVersions,
      );
    } catch (error: any) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response, null, 4));
      }
      throw error;
    }
  }

  private getRestApiUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}
