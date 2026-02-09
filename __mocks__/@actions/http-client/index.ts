import * as http from 'http';
import * as https from 'https';

export class HttpClient {
  constructor(
    public userAgent?: string,
    public handlers?: any[],
    public requestOptions?: any
  ) {}

  async get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent || 'actions-http-client',
        },
      };

      // Add basic auth if handlers are provided
      if (this.handlers && this.handlers.length > 0) {
        const handler = this.handlers[0];
        if (handler.username && handler.password) {
          const auth = Buffer.from(`${handler.username}:${handler.password}`).toString('base64');
          options.headers['Authorization'] = `Basic ${auth}`;
        }
      }

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            readBody: async () => data,
            message: {
              statusCode: res.statusCode,
            },
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  async post(url: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      const postData = typeof data === 'string' ? data : JSON.stringify(data);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'User-Agent': this.userAgent || 'actions-http-client',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      // Add basic auth if handlers are provided
      if (this.handlers && this.handlers.length > 0) {
        const handler = this.handlers[0];
        if (handler.username && handler.password) {
          const auth = Buffer.from(`${handler.username}:${handler.password}`).toString('base64');
          options.headers['Authorization'] = `Basic ${auth}`;
        }
      }

      const req = client.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          resolve({
            readBody: async () => responseData,
            message: {
              statusCode: res.statusCode,
            },
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }
}
