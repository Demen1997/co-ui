import {Component} from '@angular/core';
import {RegistrationData} from '../../core/model/account/registration-data.model';
import {AuthenticationService} from '../../core/service/authentication.service';
import {NotificationService} from '../../core/service/notification.service';
import {FORBIDDEN, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {Router} from '@angular/router';
import {MainComponent} from '../../main/main.component';
import {LoginComponent} from '../login/login.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public static readonly ROUTER_PATH = 'register';

  regData = new RegistrationData();

  constructor(private authService: AuthenticationService,
              private messageService: NotificationService,
              private router: Router) {
  }

  register() {
    if (!this.regData.validate()) {
      this.messageService.logError('Введите корректные данные');
      return;
    }

    this.authService.registerUser(this.regData)
      .subscribe(_ => {
        this.messageService.logSuccess('Пользователь успешно создан');
        this.router.navigate([LoginComponent.ROUTER_PATH]);
        window.location.hash = 'login';
      }, error => {
        switch (error.status) {
          case FORBIDDEN:
            this.messageService.logError('Это имя уже занято', 'Уникальное имя');
            break;
          case UNPROCESSABLE_ENTITY:
            this.messageService.logError('Введите валидную почту', 'Некорректная почта');
            break;
          default:
            this.messageService.logError('Неизвестная ошибка, повторите позже');
        }
      });
  }
}
