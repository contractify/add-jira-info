import * as core from "@actions/core";

import { GithubClient } from "./common/github_client";
import { JiraClient } from "./common/jira_client";

export async function run() {
  const githubToken = core.getInput("github-token", { required: true });
  const jiraBaseUrl = core.getInput("jira-base-url", { required: true });
  const jiraUsername = core.getInput("jira-username", { required: true });
  const jiraToken = core.getInput("jira-token", { required: true });
  const jiraProjectKey = core.getInput("jira-project-key", { required: true });

  const githubClient = new GithubClient(githubToken);

  const jiraClient = new JiraClient(
    jiraBaseUrl,
    jiraUsername,
    jiraToken,
    jiraProjectKey
  );

  const pullRequest = await githubClient.getPullRequest();
  const branchName = githubClient.getBranchName();
  const jiraKey = jiraClient.extractJiraKey(branchName);

  if (!jiraKey) {
    core.warning("⚠️ No Jira key found in branch name, exiting");
    return;
  }

  if (!pullRequest || !pullRequest.number) {
    core.warning("⚠️ Could not get pull request number, exiting");
    return;
  }

  const issueType = await jiraClient.getIssueType(jiraKey);
  if (!issueType) {
    core.warning("⚠️ Could not get issue type, exiting");
    return;
  }

  core.info(`📄 Branch name: ${branchName}`);
  core.info(`📄 Pull Request: ${pullRequest.number} | ${pullRequest.title}`);
  core.info(`📄 Jira key: ${jiraKey}`);
  core.info(`📄 Issue type: ${issueType}`);

  core.info(`📄 Creating label: ${issueType}`);
  await githubClient.createLabelIfNotExists(issueType, "Jira Issue Type");

  core.info(`📄 Adding label: ${issueType} to: ${pullRequest.number}`);
  await githubClient.addLabelsToIssue(pullRequest.number, [issueType]);

  core.info(`📄 Finished for ${pullRequest.number}`);
}

run();
