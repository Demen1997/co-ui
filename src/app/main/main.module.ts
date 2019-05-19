import {MainComponent} from './main.component';
import {BalanceDialog, BalancesComponent} from './balances/balances.component';
import {NgModule} from '@angular/core';
import {MainRoutingModule} from './main-routing.module';
import {PrimeNgModule} from '../core/modules/prime-ng.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CommonModule} from '@angular/common';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {FormsModule} from '@angular/forms';
import {ConfirmDialogModule, DropdownModule, KeyFilterModule} from 'primeng/primeng';
import {PaymentDialog, PaymentsComponent} from './payments/payments.component';
import {BudgetDialog, BudgetExpendDialog, BudgetsComponent} from './budgets/budgets.component';

@NgModule({
  declarations: [
    MainComponent,
    BalancesComponent,
    DashboardComponent,
    BalanceDialog,
    PaymentDialog,
    BudgetDialog,
    BudgetExpendDialog,
    PaymentsComponent,
    BudgetsComponent
  ],
  imports: [
    MainRoutingModule,
    PrimeNgModule,
    CommonModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    DropdownModule,
    FormsModule,
    KeyFilterModule
  ],
  entryComponents: [
    BalanceDialog,
    PaymentDialog,
    BudgetDialog,
    BudgetExpendDialog
  ]
})
export class MainModule {
}
