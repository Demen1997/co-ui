import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Credentials} from '../model/account/credentials.model';
import {environment} from '../../../environments/environment';
import {tap} from 'rxjs/operators';
import {AuthenticationResponse} from '../model/account/authentication-response.model';
import {RegistrationData} from '../model/account/registration-data.model';

const AUTH_TOKEN = 'authToken';

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN);

export const isAuthenticated = () => getAuthToken() != null;

const AUTH_ENDPOINT = `${environment.apiUrl}/auth/login`;
const REGISTER_ENDPOINT = `${environment.apiUrl}/auth/register`;

const processTokens = (response: AuthenticationResponse) => {
  localStorage.setItem('authToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
};

export const destroyTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

@Injectable()
export class AuthenticationService {

  constructor(private httpClient: HttpClient) {
  }

  authenticate(credentials: Credentials) {
    return this.httpClient.post<AuthenticationResponse>(AUTH_ENDPOINT, credentials).pipe(
      tap(response => processTokens(response))
    );
  }

  registerUser(regData: RegistrationData) {
    return this.httpClient.post(REGISTER_ENDPOINT, regData);
  }
}
