import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHealth(): { name: string; status: string } {
    return {
      name: 'michelin_hackaton-api',
      status: 'ok',
    }
  }
}
