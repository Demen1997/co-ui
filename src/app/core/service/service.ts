import {Inject, Injectable, InjectionToken} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable()
export class Service<T> {
  public static readonly API_URL = `${environment.apiUrl}/main`;

  public static readonly CONFIG_URL = new InjectionToken<string>('url');

  constructor(protected httpClient: HttpClient,
              @Inject(Service.CONFIG_URL) protected url: string) {
  }

  getAll(): Observable<any> {
    return this.httpClient.get(this.url, {
      observe: 'response'
    });
  }

  get(id: number): Observable<T> {
    return this.httpClient.get<T>(`${this.url}?id=${id}`);
  }

  create(entity: T) {
    return this.httpClient.post(this.url, entity, {
      observe: 'response'
    });
  }

  delete(id: number) {
    return this.httpClient.delete(`${this.url}?id=${id}`);
  }

  update(entity: T) {
    return this.httpClient.put(this.url, entity);
  }

  getAvailableCurrencies(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${environment.apiUrl}/main/currencies`);
  }
}
