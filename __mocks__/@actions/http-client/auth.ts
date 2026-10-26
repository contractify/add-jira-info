export class BearerCredentialHandler {
  constructor(public token: string) {}

  prepareRequest(options: any): void {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${this.token}`;
  }

  canHandleAuthentication(): boolean {
    return false;
  }

  async handleAuthentication(): Promise<any> {
    return null;
  }
}

export class PersonalAccessTokenCredentialHandler extends BearerCredentialHandler {}

export class BasicCredentialHandler {
  constructor(
    public username: string,
    public password: string,
  ) {}

  prepareRequest(options: any): void {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString(
      "base64",
    );
    if (!options.headers) {
      options.headers = {};
    }
    options.headers["Authorization"] = `Basic ${auth}`;
  }

  canHandleAuthentication(): boolean {
    return false;
  }

  async handleAuthentication(): Promise<any> {
    return null;
  }
}
