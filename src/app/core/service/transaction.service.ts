import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Transaction} from '../model/main/transaction.model';
import {Observable} from 'rxjs';

export interface TransactionRequest {
  balanceId: number;
  amount: number;
  description: string;
}

const BASE_URL = `${environment.apiUrl}/main/transactions`;

@Injectable()
export class TransactionService {

  constructor(private httpClient: HttpClient) {
  }

  sendTransaction(req: TransactionRequest) {
    return this.httpClient.post(BASE_URL, req, {
      observe: 'response'
    });
  }

  expendBudget(req: TransactionRequest, budgetId: number) {
    return this.httpClient.post(BASE_URL + '/expandBudget', {...req, budgetId}, {
      observe: 'response'
    });
  }

  getTransactions(balances: number[]): Observable<Transaction[]> {
    return this.httpClient.get<Transaction[]>(`${BASE_URL}?balances=${balances.join(',')}`);
  }
}
