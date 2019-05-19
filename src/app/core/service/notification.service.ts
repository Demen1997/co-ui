import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';

@Injectable()
export class NotificationService {

  constructor(private messageService: MessageService) {
  }

  logError(details: string, summary?: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary ? summary : 'ERROR',
      detail: details
    });
  }

  logSuccess(details: string, summary?: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary ? summary : 'SUCCESS',
      detail: details
    });
  }
}
