export interface MatchConfig {
  all?: string[];
  any?: string[];
}

export type StringOrMatchConfig = string | MatchConfig;
