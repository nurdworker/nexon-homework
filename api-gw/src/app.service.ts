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

  //여기에 로그아웃 추가
  //여기에 refresh 추가

  //event - public
  //event - manager
  async getEventOptions(authHeader: string): Promise<any> {
    const response = await axios.get(
      'http://event:5000/event/manager/options',
      {
        headers: { authorization: authHeader },
      },
    );
    return response.data;
  }

  async createEvent(authHeader: string, body: any): Promise<any> {
    const response = await axios.post('http://event:5000/event/manager', body, {
      headers: { authorization: authHeader },
    });
    return response.data;
  }
  //event - user

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
}
