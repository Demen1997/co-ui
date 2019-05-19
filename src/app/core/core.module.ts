import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthenticationService} from './service/authentication.service';
import {NotificationService} from './service/notification.service';
import {Service} from './service/service';
import {TransactionService} from './service/transaction.service';
import {BalancesService} from './service/balances.service';
import {ExchangeService} from './service/exchange.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthenticationService,
    NotificationService,
    Service,
    TransactionService,
    BalancesService,
    ExchangeService
  ]
})
export class CoreModule { }
