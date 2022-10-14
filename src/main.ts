import * as core from "@actions/core";
import * as github from "@actions/github";

import * as common from "./common/common";
import * as helpers from "./common/helpers";
import * as jira from "./jira";

export async function run() {
  const token = core.getInput("token", { required: true });
  const jiraToken = core.getInput("jira-token", { required: true });
  const jiraBaseUrl = core.getInput("jira-base-url", { required: true });

  const client: common.ClientType = github.getOctokit(token);
  const prNumber = await helpers.getPrNumber(client);
  if (!prNumber) {
    console.log("Could not get pull request number from context, exiting");
    return;
  }

  core.info(`📄 Pull Request Number: ${prNumber}`);

  const jiraClient = new jira.Client(jiraToken, jiraBaseUrl);
  const issueTypes = await jiraClient.getIssueTypes();
  core.info(`issueTypes: ${issueTypes.join(", ")}`);

  // core.info(`🏭 Running labeler for ${prNumber}`);
  // await runLabeler(client, configPath, prNumber);

  // core.info(`🏭 Running assigner for ${prNumber}`);
  // await runAssigner(client, configPath, prNumber);

  // core.info(`🏭 Running owner for ${prNumber}`);
  // await runOwner(client, prNumber);

  core.info(`📄 Finished for ${prNumber}`);
}

run();
