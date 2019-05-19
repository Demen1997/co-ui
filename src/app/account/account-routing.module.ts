import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {AccountComponent} from './account.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';

const routes: Route[] = [
  {
    path: 'login',
    component: AccountComponent,
    children: [
      {
        path: '',
        component: LoginComponent
      },
      {
        path: RegisterComponent.ROUTER_PATH,
        component: RegisterComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
