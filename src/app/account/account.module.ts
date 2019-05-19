import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {AccountRoutingModule} from './account-routing.module';
import {AccountComponent} from './account.component';
import {AuthenticationService} from '../core/service/authentication.service';
import {ButtonModule, InputTextModule, KeyFilterModule, PasswordModule} from 'primeng/primeng';
import { RegisterComponent } from './register/register.component';
import {FormsModule} from '@angular/forms';
import {ToastModule} from 'primeng/toast';
import {PrimeNgModule} from '../core/modules/prime-ng.module';

@NgModule({
  declarations: [
    AccountComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    AccountRoutingModule,
    CommonModule,
    FormsModule,
    PrimeNgModule
  ]
})
export class AccountModule {
}
