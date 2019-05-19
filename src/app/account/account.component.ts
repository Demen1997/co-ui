import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {isAuthenticated} from '../core/service/authentication.service';
import {MainComponent} from '../main/main.component';

@Component({
  selector: 'app-account',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AccountComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
    if (isAuthenticated()) {
      this.router.navigate([MainComponent.ROUTER_PATH]);
    }
  }
}
