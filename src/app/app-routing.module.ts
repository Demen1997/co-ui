import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {MainComponent} from './main/main.component';
import {AuthGuard} from './core/guard/auth.guard';

const APP_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: MainComponent.ROUTER_PATH,
    pathMatch: 'full'
  },
  {
    path: MainComponent.ROUTER_PATH,
    component: MainComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    AuthGuard
  ]
})
export class AppRoutingModule {
}
