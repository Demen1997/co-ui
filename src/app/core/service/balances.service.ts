import {Balance} from '../model/main/balance.model';
import {Service} from './service';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BalancesService extends Service<Balance> {

  constructor(httpClient: HttpClient) {
    super(httpClient, Service.API_URL + '/balances');
  }

  getAllByCurrency(currency: string) {
    return this.httpClient.get(`${this.url}?currency=${currency}`, {
      observe: 'response'
    });
  }
}
