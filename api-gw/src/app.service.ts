import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface SignUpInfo {
  email: string;
  password: string;
  nickName: string;
}

export interface SignInInfo {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  nickName: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from api-gw';
  }
  postBye(body): string {
    console.log('bye test 1');
    return `Bye ${body.name}`;
  }

  //auth
  async signUp(signUpInfo: SignUpInfo): Promise<AuthResponse> {
    const response = await axios.post('http://auth:4000/signup', signUpInfo);
    return response.data;
  }

  async signIn(signInInfo: SignInInfo): Promise<AuthResponse> {
    const response = await axios.post('http://auth:4000/signin', signInInfo);
    return response.data;
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axios.post(
      'http://auth:4000/refresh',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    );
    return response.data;
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await axios.post(
      'http://auth:4000/logout',
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    );
    return response.data;
  }

  //event - public
  async getEventsLists(): Promise<any> {
    return this.handleRequest('GET', 'http://event:5000/lists');
  }

  async getEventById(eventId: string): Promise<any> {
    return this.handleRequest('GET', `http://event:5000/list/${eventId}`);
  }

  //event - manager

  async getEventOptions(authHeader: string): Promise<any> {
    return this.handleRequest(
      'GET',
      'http://event:5000/event/manager/options',
      {
        authorization: authHeader,
      },
    );
  }

  async createEvent(authHeader: string, body: any): Promise<any> {
    return this.handleRequest('POST', 'http://event:5000/event/manager', body, {
      authorization: authHeader,
    });
  }

  async toggleEventActive(
    authHeader: string,
    body: { eventId: string },
  ): Promise<any> {
    return this.handleRequest(
      'POST',
      'http://event:5000/event/manager/toggle-active',
      body,
      {
        authorization: authHeader,
      },
    );
  }

  //event - user
  async requestRewards(
    authHeader: string,
    body: { eventId: string },
  ): Promise<any> {
    return this.handleRequest(
      'POST',
      'http://event:5000/event/user/request',
      body,
      {
        authorization: authHeader,
      },
    );
  }

  async getMyRequests(authHeader: string): Promise<any> {
    return this.handleRequest(
      'GET',
      'http://event:5000/event/user/request/me',
      {
        authorization: authHeader,
      },
    );
  }

  async getEventRequests(): Promise<any> {
    return this.handleRequest(
      'GET',
      'http://event:5000/event/manager/requests',
    );
  }

  async exportEventRequests(): Promise<Buffer> {
    const response = await axios.get(
      'http://event:5000/event/manager/requests/export',
      {
        responseType: 'arraybuffer',
      },
    );
    const buffer = Buffer.from(response.data);
    return buffer;
  }

  // 얘는 auth쪽 test api들들
  async getHelloFromAuth(): Promise<any> {
    const response = await axios.get('http://auth:4000/hello');
    console.log('hello from auth test get');
    return response.data;
  }

  async getFromTestAuth(): Promise<any> {
    const response = await axios.get('http://auth:4000/test/get');
    console.log('hello from auth test get(api-gw service)');
    return response.data;
  }

  async getKafkaFromTestAuth(): Promise<any> {
    const response = await axios.get('http://auth:4000/test/kafka');
    console.log('hello from auth test kafka(api-gw service)');
    return response.data;
  }

  //event 테스트 api들들

  async getHelloFromEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/hello');
    return response.data;
  }

  async getFromTestEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/test/get');
    return response.data;
  }

  async getOnlyForUserFromEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/test/role');
    console.log('role test');
    return response.data;
  }

  async getHeaderFromEvent(req: Request): Promise<any> {
    const response = await axios.get('http://event:5000/test/header', {
      headers: {
        Authorization: req.headers['authorization'] || '',
      },
    });
    return response.data;
  }

  async getItemsFromTestEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/test/item');
    return response.data;
  }

  private async handleRequest<T>(
    method: 'GET' | 'POST',
    url: string,
    dataOrHeaders?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    try {
      if (method === 'GET') {
        const response = await axios.get<T>(url, {
          headers: dataOrHeaders, // GET에서는 dataOrHeaders가 headers 역할
        });
        return response.data;
      } else if (method === 'POST') {
        const response = await axios.post<T>(url, dataOrHeaders, {
          headers,
        });
        return response.data;
      }
      throw new Error(`Unsupported method: ${method}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(`API Error from ${method} ${url}:`, error.response.data);
        throw new Error(JSON.stringify(error.response.data));
      }
      throw error;
    }
  }
}
