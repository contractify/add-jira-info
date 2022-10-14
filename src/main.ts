import * as core from "@actions/core";
import * as github from "@actions/github";

import * as common from "./common/common";
import * as helpers from "./common/helpers";
import * as extractor from "./extractor";
import * as jira from "./jira";

export async function run() {
  const token = core.getInput("token", { required: true });
  const jiraProjectKey = core.getInput("jira-project-key", { required: true });
  const jiraToken = core.getInput("jira-token", { required: true });
  const jiraBaseUrl = core.getInput("jira-base-url", { required: true });

  const branchName = github.context.ref.replace("refs/heads/", "");
  core.info(`📄 Branch name: ${branchName}`);

  const jiraKey = extractor.jiraKey(branchName, jiraProjectKey);
  if (!jiraKey) {
    core.info("No Jira key found in branch name, exiting");
    return;
  }

  const client: common.ClientType = github.getOctokit(token);
  const prNumber = await helpers.getPrNumber(client);
  if (!prNumber) {
    console.log("Could not get pull request number from context, exiting");
    return;
  }

  const jiraClient = new jira.Client(jiraToken, jiraBaseUrl);
  // const issueTypes = await jiraClient.getIssueTypesForProject(jiraProjectKey);
  // core.info(`Issue Types: ${issueTypes.join(", ")}`);

  const formattedJiraKey = `${jiraProjectKey}-${jiraKey}`;

  core.info(`📄 PR Number: ${jiraProjectKey}-${jiraKey}`);
  core.info(`📄 Jira key: ${formattedJiraKey}`);

  const issueType = await jiraClient.getIssueType(formattedJiraKey);
  core.info(`📄 Issue type: ${issueType}`);
  if (!issueType) {
    console.log("Could not get issue type, exiting");
    return;
  }

  // TODO: create label if it doesn't exist
  core.info(`📄 Creating label: ${issueType}`);
  await client.rest.issues.createLabel({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    name: issueType,
    color: "#FBCA04",
  });

  // TODO: add label to pull request (not overwriting existing ones)
  core.info(`📄 Adding label: ${issueType} to: ${prNumber}`);
  await client.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: [issueType],
  });

  core.info(`📄 Finished for ${prNumber}`);
}

run();
