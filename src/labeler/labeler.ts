import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import { Minimatch, IMinimatch } from "minimatch";

import * as common from "../common/common";
import * as helpers from "../common/helpers";
import * as types from "./types";

export async function runLabeler(
  client: common.ClientType,
  configPath: string,
  prNumber: number
) {
  try {
    const { data: pullRequest } = await client.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
    });

    core.debug(`fetching changed files for pr #${prNumber}`);
    const changedFiles: string[] = await helpers.getChangedFiles(
      client,
      prNumber
    );

    const labelGlobs: Map<string, types.StringOrMatchConfig[]> =
      await getLabelGlobs(client, configPath);

    const labels: string[] = [];
    for (const [label, globs] of labelGlobs.entries()) {
      core.debug(`processing ${label}`);
      if (checkGlobs(changedFiles, globs)) {
        labels.push(label);
      }
    }

    if (labels.length > 0) {
      core.info(`📄 Adding labels`);
      for (const label of labels) {
        core.info(` 📄 Adding label: ${label}`);
      }
      await addLabels(client, prNumber, labels);
    }
  } catch (error: any) {
    core.error(`  🚨 ${error}`);
    core.setFailed(error.message);
  }
}

async function getLabelGlobs(
  client: common.ClientType,
  configurationPath: string
): Promise<Map<string, types.StringOrMatchConfig[]>> {
  const configurationContent: string = await helpers.fetchContent(
    client,
    configurationPath
  );
  core.debug(configurationContent);
  const configObject: any = yaml.load(configurationContent);
  return getLabelGlobMapFromObject(configObject);
}

function getLabelGlobMapFromObject(
  configObject: any
): Map<string, types.StringOrMatchConfig[]> {
  const labelConfig = configObject["labels"];

  core.debug(labelConfig);

  const labelGlobs: Map<string, types.StringOrMatchConfig[]> = new Map();
  for (const label in labelConfig) {
    if (typeof labelConfig[label] === "string") {
      labelGlobs.set(label, [labelConfig[label]]);
    } else if (labelConfig[label] instanceof Array) {
      labelGlobs.set(label, labelConfig[label]);
    } else {
      throw Error(
        `found unexpected type for label ${label} (should be string or array of globs)`
      );
    }
  }

  return labelGlobs;
}

function toMatchConfig(config: types.StringOrMatchConfig): types.MatchConfig {
  if (typeof config === "string") {
    return {
      any: [config],
    };
  }

  return config;
}

function printPattern(matcher: IMinimatch): string {
  return (matcher.negate ? "!" : "") + matcher.pattern;
}

export function checkGlobs(
  changedFiles: string[],
  globs: types.StringOrMatchConfig[]
): boolean {
  for (const glob of globs) {
    core.debug(` checking pattern ${JSON.stringify(glob)}`);
    const matchConfig = toMatchConfig(glob);
    if (checkMatch(changedFiles, matchConfig)) {
      return true;
    }
  }
  return false;
}

function isMatch(changedFile: string, matchers: IMinimatch[]): boolean {
  core.debug(`    matching patterns against file ${changedFile}`);
  for (const matcher of matchers) {
    core.debug(`   - ${printPattern(matcher)}`);
    if (!matcher.match(changedFile)) {
      core.debug(`   ${printPattern(matcher)} did not match`);
      return false;
    }
  }

  core.debug(`   all patterns matched`);
  return true;
}

// equivalent to "Array.some()" but expanded for debugging and clarity
function checkAny(changedFiles: string[], globs: string[]): boolean {
  const matchers = globs.map((g) => new Minimatch(g));
  core.debug(`  checking "any" patterns`);
  for (const changedFile of changedFiles) {
    if (isMatch(changedFile, matchers)) {
      core.debug(`  "any" patterns matched against ${changedFile}`);
      return true;
    }
  }

  core.debug(`  "any" patterns did not match any files`);
  return false;
}

// equivalent to "Array.every()" but expanded for debugging and clarity
function checkAll(changedFiles: string[], globs: string[]): boolean {
  const matchers = globs.map((g) => new Minimatch(g));
  core.debug(` checking "all" patterns`);
  for (const changedFile of changedFiles) {
    if (!isMatch(changedFile, matchers)) {
      core.debug(`  "all" patterns did not match against ${changedFile}`);
      return false;
    }
  }

  core.debug(`  "all" patterns matched all files`);
  return true;
}

function checkMatch(
  changedFiles: string[],
  matchConfig: types.MatchConfig
): boolean {
  if (matchConfig.all !== undefined) {
    if (!checkAll(changedFiles, matchConfig.all)) {
      return false;
    }
  }

  if (matchConfig.any !== undefined) {
    if (!checkAny(changedFiles, matchConfig.any)) {
      return false;
    }
  }

  return true;
}

async function addLabels(
  client: common.ClientType,
  prNumber: number,
  labels: string[]
) {
  await client.rest.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels,
  });
}
