import * as core from "@actions/core";
import * as github from "@actions/github";

import { GithubClient } from "./common/github_client";
import { JiraClient } from "./common/jira_client";
import { Updater } from "./common/updater";

export async function run() {
  if (github.context.actor === "dependabot[bot]") {
    core.info(`🚨 Dependabot, ignoring`);
    return;
  }

  const githubToken = core.getInput("github-token", { required: true });
  const jiraBaseUrl = core.getInput("jira-base-url", { required: true });
  const jiraUsername = core.getInput("jira-username", { required: true });
  const jiraToken = core.getInput("jira-token", { required: true });
  const jiraProjectKey = core.getInput("jira-project-key", { required: true });

  const addLabelWithIssueType = core.getBooleanInput(
    "add-label-with-issue-type",
  );
  const issueTypeLabelColor =
    core.getInput("issue-type-label-color") || "FBCA04";
  const issueTypeLabelDescription =
    core.getInput("issue-type-label-description") || "Jira Issue Type";
  const addJiraKeyToTitle = core.getBooleanInput("add-jira-key-to-title");
  const addJiraKeyToBody = core.getBooleanInput("add-jira-key-to-body");
  const addJiraFixVersionsToBody = core.getBooleanInput(
    "add-jira-fix-versions-to-body",
  );

  const githubClient = new GithubClient(githubToken);

  const jiraClient = new JiraClient(
    jiraBaseUrl,
    jiraUsername,
    jiraToken,
    jiraProjectKey,
  );

  const pullRequest = await githubClient.getPullRequest();
  const branchName = githubClient.getBranchName();
  core.info(`📄 Context details`);
  core.info(`    Branch name: ${branchName}`);

  if (branchName.startsWith("dependabot")) {
    core.info(`🚨 Dependabot, ignoring`);
    return;
  }

  const jiraKey = jiraClient.extractJiraKey(branchName);

  if (!jiraKey) {
    core.warning("⚠️ No Jira key found in branch name, exiting");
    return;
  }

  if (!pullRequest) {
    core.warning("⚠️ Could not get pull request number, exiting");
    return;
  }

  const jiraIssue = await jiraClient.getIssue(jiraKey);
  if (!jiraIssue) {
    core.warning("⚠️ Could not get issue, exiting");
    return;
  }
  core.info(`    Pull Request: ${pullRequest}`);
  core.info(`    Jira key: ${jiraKey}`);
  core.info(`    Issue type: ${jiraIssue}`);

  if (addLabelWithIssueType) {
    core.info(`📄 Adding pull request label`);

    if (!jiraIssue.type) {
      core.info(`   Issue type undefined for ${jiraIssue}`);
    } else {
      if (!(await githubClient.labelExists(jiraIssue.type))) {
        core.info(`    Creating label: ${jiraIssue.type}`);
        await githubClient.createLabel(
          jiraIssue.type,
          issueTypeLabelDescription,
          issueTypeLabelColor,
        );
      }

      core.info(`    Adding label: ${jiraIssue.type} to: ${pullRequest}`);
      await githubClient.addLabelsToIssue(pullRequest, [jiraIssue.type]);
    }
  }

  if (addJiraKeyToTitle || addJiraKeyToBody) {
    core.info(`📄 Adding Jira key to pull request`);

    const updater = new Updater(jiraIssue);

    if (addJiraKeyToTitle) {
      core.info(`    Updating pull request title`);
      pullRequest.title = updater.title(pullRequest.title);
    }

    if (addJiraKeyToBody) {
      core.info(`    Updating pull request body`);
      pullRequest.body = updater.body(pullRequest.body);
    }

    if (addJiraFixVersionsToBody) {
      pullRequest.body = updater.addFixVersionsToBody(pullRequest.body);
    }

    core.info(`    Updating pull request`);
    await githubClient.updatePullRequest(pullRequest);
  }

  core.info(`📄 Finished`);
}

run();
