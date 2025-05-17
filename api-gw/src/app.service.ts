import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
  async signUp(signUpInfo: {
    email: string;
    password: string;
    nickName: string;
  }): Promise<any> {
    const response = await axios.post('http://auth:4000/signup', signUpInfo);
    return response.data;
  }

  async signIn(signInInfo: { email: string; password: string }): Promise<any> {
    const response = await axios.post('http://auth:4000/signin', signInInfo);
    return response.data;
  }

  // 얘는 auth쪽 app꺼꺼
  async getHelloFromAuth(): Promise<any> {
    const response = await axios.get('http://auth:4000/hello');
    console.log('hello from auth test get');
    return response.data;
  }

  // auth쪽쪽 kafka쪽 get api 테스트
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

  async getHelloFromEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/hello');
    return response.data;
  }
}
