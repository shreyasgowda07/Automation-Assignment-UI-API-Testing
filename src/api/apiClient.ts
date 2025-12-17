import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class ApiClient {
  client: AxiosInstance;

  constructor(baseUrl?: string, token?: string) {
    this.client = axios.create({
      baseURL: baseUrl || process.env.API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 10_000
    });
  }

  async post(path: string, body: any) {
    return this.client.post(path, body);
  }

  async get(path: string) {
    return this.client.get(path);
  }
}
