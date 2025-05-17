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

  async getHelloFromAuth(): Promise<any> {
    const response = await axios.get('http://auth:4000/hello');
    return response.data;
  }

  async callKafkaFromAuth(): Promise<any> {
    const response = await axios.post('http://auth:4000/bye', {
      name: 'muzzi',
    });
    return response.data;
  }

  async getHelloFromEvent(): Promise<any> {
    const response = await axios.get('http://event:5000/hello');
    return response.data;
  }
}
