# Jira issue type to label

Automatically labels your pull request based on Jira issue type.

```yaml
name: PR Automation

on:
  [ push ]

permissions:
  contents: write
  checks: write
  pull-requests: write

jobs:
  automation:
    runs-on: ubuntu-latest
    steps:
    - name: Assign Labels and Users
      uses: contractify/jira-issue-type-to-label@v1.0.0
      if: ${{ !startsWith(github.ref, 'refs/heads/dependabot/') }}
      with:
        token: "${{ secrets.GITHUB_TOKEN }}"
        jira-token: ${{ secrets.JIRA_TOKEN }}
        jira-base-url: https://your-domain.atlassian.net
        jira-project-key: "PRJ"
```

## Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the action:

| Name | Description | Required | Default |
| - | - | - | - |
| `token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access | N/A |
| `jira-token` | Token used to fetch Jira Issue information.  Check [below](#jira-token) for more details on how to generate the token. | true     | null    |
| `jira-base-url` | The subdomain of JIRA cloud that you use to access it. Ex: "https://your-domain.atlassian.net". | true     | null    |
| `jira-project-key` | TKey of project in jira. First part of issue key | true     | null    |

Tokens are private, so it's suggested adding them as [GitHub secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets).

## `jira-token`

The Jira token is used to fetch issue information via the Jira REST API. To get the token:-
1. Generate an [API token via JIRA](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)
2. Add value `<jira username>:<jira api token>` to the `JIRA_TOKEN` secret in your GitHub project.
   For example, if the username is `ci@example.com` and the token is `954c38744be9407ab6fb`, then `ci@example.com:954c38744be9407ab6fb` needs to be added as a secret

Note: The user should have the [required permissions (mentioned under GET Issue)](https://developer.atlassian.com/cloud/jira/platform/rest/v3/?utm_source=%2Fcloud%2Fjira%2Fplatform%2Frest%2F&utm_medium=302#api-rest-api-3-issue-issueIdOrKey-get).
