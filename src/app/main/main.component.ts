import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';

@Component({
  selector: 'app-main',
  template: `<router-outlet></router-outlet>`
})
export class MainComponent {
  public static readonly ROUTER_PATH = 'main';

  constructor(private router: Router) {
    this.router.navigate([`main/${DashboardComponent.ROUTER_PATH}`]);
  }
}
