export const context = {
  payload: {
    pull_request: {
      number: 123,
      head: {
        ref: "feature/123-sample-feature",
      },
    },
  },
  repo: {
    owner: "monalisa",
    repo: "helloworld",
  },
};

const mockApi = {
  rest: {
    issues: {
      addLabels: jest.fn(),
      removeLabel: jest.fn(),
    },
    pulls: {
      get: jest.fn().mockResolvedValue({
        data: {
          number: 123,
          title: "pr title",
        },
      }),
      listFiles: {
        endpoint: {
          merge: jest.fn().mockReturnValue({}),
        },
      },
    },
    repos: {
      getContent: jest.fn(),
    },
  },
  paginate: jest.fn(),
};

export const getOctokit = jest.fn().mockImplementation(() => mockApi);
