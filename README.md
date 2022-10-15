# Add Jira info to a pull request

## Scope

- Detect Jira key from the branch name
- Add the Jira key as prefix to the pull request title if not present
- Add the Jira key and issue title to the pull request body if not present
- Assign a label to the pull request with the issue type

```yaml
name: Automation

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    types:
      - opened
      - ready_for_review
      - reopened
      - synchronize
  workflow_dispatch:

permissions:
  contents: write
  checks: write
  pull-requests: write

jobs:
  automation:
    runs-on: ubuntu-latest
    steps:
    - name: Add Jira info
      uses: contractify/add-jira-info@v1
      if: ${{ !startsWith(github.ref, 'refs/heads/dependabot/') }}
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        jira-base-url: ${{ secrets.JIRA_BASE_URL }}
        jira-username: ${{ secrets.JIRA_USERNAME }}
        jira-token: ${{ secrets.JIRA_TOKEN }}
        jira-project-key: CTR
        add-label-with-issue-type: true
        issue-type-label-color: FBCA04
        issue-type-label-description: 'Jira Issue Type'
        add-jira-key-tot-title: true
        add-jira-key-tot-body: true
```

## Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the action:

| Name | Description | Required | Default |
| - | - | - | - |
| `github-token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `jira-base-url` | The subdomain of JIRA cloud that you use to access it. Ex: "https://your-domain.atlassian.net". | `true`     | `null`    |
| `jira-username` | Username used to fetch Jira Issue information.  Check [below](#how-to-get-the-jira-token-and-jira-username) for more details on how to generate the token. | `true`     | `null`    |
| `jira-token` | Token used to fetch Jira Issue information.  Check [below](#how-to-get-the-jira-token-and-jira-username) for more details on how to generate the token. | `true`     | `null`    |
| `jira-project-key` | Key of project in jira. First part of issue key | `true`     | `null`    |
| `add-label-with-issue-type` | If set to `true`, a label with the issue type from Jira will be added to the pull request | `false`     | `true`    |
| `issue-type-label-color` | The hex color to use for the issue type label | `false`     | `FBCA04`    |
| `issue-type-label-description` | The description to use for the issue type label | `false`     | `Jira Issue Type`    |
| `add-jira-key-tot-title` | If set to `true`, the title of the pull request will be prefixed with the Jira issue key | `false`     | `true`    |
| `add-jira-key-tot-body` | If set to `true`, the body of the pull request will be suffix with a link to the Jira issue | `false`     | `true`    |

Tokens are private, so it's suggested adding them as [GitHub secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets).

## How to get the `jira-token` and `jira-username`

The Jira token is used to fetch issue information via the Jira REST API. To get the token:
1. Generate an [API token via JIRA](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)
2. Add the Jira username to the `JIRA_USERNAME` secret in your project
3. Add the Jira API token to the `JIRA_TOKEN` secret in your project

Note: The user should have the [required permissions (mentioned under GET Issue)](https://developer.atlassian.com/cloud/jira/platform/rest/v3/?utm_source=%2Fcloud%2Fjira%2Fplatform%2Frest%2F&utm_medium=302#api-rest-api-3-issue-issueIdOrKey-get).
