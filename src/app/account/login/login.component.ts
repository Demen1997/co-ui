import {Component} from '@angular/core';
import {AuthenticationService} from '../../core/service/authentication.service';
import {Credentials} from '../../core/model/account/credentials.model';
import {NotificationService} from '../../core/service/notification.service';
import {UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {Router} from '@angular/router';
import {MainComponent} from '../../main/main.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  public static readonly ROUTER_PATH = 'login';

  credentials: Credentials = new Credentials();

  constructor(private authService: AuthenticationService,
              private messageService: NotificationService,
              private router: Router) {
  }

  login() {
    if (!this.credentials.validate()) {
      this.messageService.logError('Укажите псевдоним и пароль');
      return;
    }
    this.authService.authenticate(this.credentials)
      .subscribe(
        () => this.router.navigate([MainComponent.ROUTER_PATH]),
        (error) => {
          if (error.status === UNPROCESSABLE_ENTITY) {
            this.messageService.logError('Логин или пароль был неправильно введен', 'Не удалось войти');
            this.credentials.password = '';
          } else {
            this.messageService.logError('Неизвестная ошибка, попробуйте позже');
          }
        });
  }
}
