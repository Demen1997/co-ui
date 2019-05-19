import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

const buildURL = c => `https://api.exchangeratesapi.io/latest?base=${c}&symbols=RUB`;

export interface ExchangeRate {
  base: string;
  rates: {
    RUB: number;
  };
  date: string;
}

@Injectable()
export class ExchangeService {

  constructor(private httpClient: HttpClient) {
  }

  getUSDExchange() {
    return this.httpClient.get(buildURL('USD'));
  }


  getEURExchange() {
    return this.httpClient.get(buildURL('EUR'));
  }

  getBudgetInfo(dateFrom: number, dateTo: number) {
    return this.httpClient.get(`${environment.apiUrl}/main/transactions/expandBudget?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  }
}
