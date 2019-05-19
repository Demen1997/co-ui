import {Route, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {MainComponent} from './main.component';
import {BalancesComponent} from './balances/balances.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {PaymentsComponent} from './payments/payments.component';
import {BudgetsComponent} from './budgets/budgets.component';

const routes: Route[] = [
  {
    path: MainComponent.ROUTER_PATH,
    component: MainComponent,
    children: [
      {
        path: DashboardComponent.ROUTER_PATH,
        component: DashboardComponent
      },
      {
        path: BalancesComponent.ROUTER_PATH,
        component: BalancesComponent
      },
      {
        path: PaymentsComponent.ROUTER_PATH,
        component: PaymentsComponent
      },
      {
        path: BudgetsComponent.ROUTER_PATH,
        component: BudgetsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
