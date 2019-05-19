import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {isAuthenticated} from '../service/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate() {
    return isAuthenticated();
  }

  canActivateChild() {
    return isAuthenticated();
  }
}
