export function jiraKey(
  input: string,
  jiraProjectKey: string
): string | undefined {
  const pattern = `^${jiraProjectKey}-(?<number>\\d+)`;
  const regex = new RegExp(pattern, "i");
  const match = input.match(regex);

  return match?.groups?.number;
}
