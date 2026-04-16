import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RefreshDashboardService {
  constructor(private readonly httpService: HttpService) {}

  async triggerFlow(url: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.post(url, {}));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Error triggering Power Automate flow: ${message}`,
      );
    }
  }
}
