# Add Jira info to a pull request

At [Contractify](https://contractify.io), we like to keeps things nice, tidy and
organized. We are using [Jira](https://www.atlassian.com/nl/software/jira) for
our issue management and [GitHub](https://www.github.com) for our version control.

Since we want to have more context with our pull requests, we decided to create
a [GitHub action](https://github.com/features/actions) which helps us in adding
Jira data to the pull request.

The current version allows you to:

- Detect Jira key from the branch name
- Add the Jira key as prefix to the pull request title if not present
- Add the Jira key and issue title to the pull request body if not present
- Assign a label to the pull request with the Jira issue type

This makes it less labour intensive for a developer to create pull requests and
adds more information for the people who need to e.g. review the requests.

## Sample action setup

To get started, you will need to create a GitHub action workflow file. If you
need more information on how to set that up, check
[here](https://docs.github.com/en/actions/quickstart).

In our repositories, we keep these actions in a separate workflow, so we usually
add a file called `.github/workflows/automation.yml` to our repository and put
the following content in there:

```yaml
name: Automation

on:
  pull_request:
    types:
      - opened
      - ready_for_review
      - reopened
      - synchronize
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write

jobs:
  automation:
    runs-on: ubuntu-latest
    steps:
      - name: Add Jira info
        uses: contractify/add-jira-info@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          jira-base-url: ${{ secrets.JIRA_BASE_URL }}
          jira-username: ${{ secrets.JIRA_USERNAME }}
          jira-token: ${{ secrets.JIRA_TOKEN }}
          jira-project-key: PRJ
          add-label-with-issue-type: true
          issue-type-label-color: FBCA04
          issue-type-label-description: "Jira Issue Type"
          add-jira-key-to-title: true
          add-jira-key-to-body: true
          add-jira-fix-versions-to-body: true
```

The `on:` section defines when the workflow needs to run. We usually run them
on everything that has to do with a pull request. We also use
`workflow_dispatch` to allow us to manually trigger the workflow.

The only step which is there is the one that adds the Jira info.

We strongly suggest to store the sensitive configuration parameters as
[secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## Inputs

Various inputs are defined in [`action.yml`](action.yml) to let you configure the action:

| Name                            | Description                                                                                                                                               | Required | Default           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- |
| `github-token`                  | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret, with `contents:read` and `pull-requests:write` access                         | N/A      |
| `jira-base-url`                 | The subdomain of JIRA cloud that you use to access it. Ex: "https://your-domain.atlassian.net".                                                           | `true`   | `null`            |
| `jira-username`                 | Username used to fetch Jira Issue information. Check [below](#how-to-get-the-jira-token-and-jira-username) for more details on how to generate the token. | `true`   | `null`            |
| `jira-token`                    | Token used to fetch Jira Issue information. Check [below](#how-to-get-the-jira-token-and-jira-username) for more details on how to generate the token.    | `true`   | `null`            |
| `jira-project-key`              | Key of project in jira. First part of issue key                                                                                                           | `true`   | `null`            |
| `add-label-with-issue-type`     | If set to `true`, a label with the issue type from Jira will be added to the pull request                                                                 | `false`  | `true`            |
| `issue-type-label-color`        | The hex color to use for the issue type label                                                                                                             | `false`  | `FBCA04`          |
| `issue-type-label-description`  | The description to use for the issue type label                                                                                                           | `false`  | `Jira Issue Type` |
| `add-jira-key-to-title`         | If set to `true`, the title of the pull request will be prefixed with the Jira issue key                                                                  | `false`  | `true`            |
| `add-jira-key-to-body`          | If set to `true`, the body of the pull request will be suffix with a link to the Jira issue                                                               | `false`  | `true`            |
| `add-jira-fix-versions-to-body` | If set to `true`, the body of the pull request will be suffix with the `fixVersions` from to the Jira issue                                               | `false`  | `true`            |

Tokens are private, so it's suggested adding them as [GitHub secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets).

## In Detail

### Getting the Jira key from the branch name

The branch name is used to get the linked Jira key.

We usually name our branches like this:

```
PRJ-1234_some-short-description
```

The following formats will also work:

```
PRJ-1234-some-short-description
feature/PRJ-1234_some-short-description
some-short-description_PRJ-1234
feature/some-short-description_PRJ-1234
feature/PRJ-1234_some-short-description
```

### Prefix the title with the Jira key

When the title of the PR doesn't contain a reference to the Jira key yet, it will
automatically be prefixed to the title (if enabled).

So, the following title:

```
My Pull Request Title
```

Will become:

```
PRJ-1234 | My Pull Request Title
```

### Adding the Jira key to the body of the pull request

When the Jira key isn't present in the pull request body, it will be added as a
suffix including the summary of the Jira issue.

It will be shown in the following format, as a hyperlink to the Jira issue:

> [**PRJ-1234** | My Jira issue summary](#)

### Adding the Jira issue type as a label

When enabled, you can automatically have a label added with the Jira issue type
as it's name. The action will check the Jira issue key against your Jira install
and extract the issue type name.

Once the issue type is found, a label with the issue type in lowercase as the
name will be created if not present yet. You can configure the color of the
label in the settings of the action. The color will only be used for labels that
don't exist yet.

It will automatically be assigned to the pull request.

## How to get the `jira-token` and `jira-username`

The Jira token is used to fetch issue information via the Jira REST API. To get the token:

1. Generate an [API token via JIRA](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)
2. Add the Jira username to the `JIRA_USERNAME` secret in your project
3. Add the Jira API token to the `JIRA_TOKEN` secret in your project

Note: The user should have the [required permissions (mentioned under GET Issue)](https://developer.atlassian.com/cloud/jira/platform/rest/v3/?utm_source=%2Fcloud%2Fjira%2Fplatform%2Frest%2F&utm_medium=302#api-rest-api-3-issue-issueIdOrKey-get).

## About Contractify

Contractify is a blooming Belgian SaaS scale-up offering contract management software and services.

We help business leaders, legal & finance teams to

- 🗄️ centralize contracts & responsibilities, even in a decentralized organization.
- 📝 keep track of all contracts & related mails or documents in 1 tool
- 🔔 automate & collaborate on contract follow-up tasks
- ✒️ approve & sign documents safely & fast
- 📊 report on custom contract data

The cloud platform is easily supplemented with full contract management support, including:

- ✔️ registration and follow up of your existing & new contracts
- ✔️ expert advice on contract management
- ✔️ periodic reporting & status updates

Start automating your contract management for free with Contractify on:
https://info.contractify.io/free-trial
