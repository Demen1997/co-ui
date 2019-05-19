import {Component, OnInit} from '@angular/core';
import {isAuthenticated} from './core/service/authentication.service';
import {Router} from '@angular/router';
import {LoginComponent} from './account/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
  }

  ngOnInit() {
    if (!isAuthenticated()) {
      this.router.navigate([LoginComponent.ROUTER_PATH]);
    }
  }

  isAuthenticated() {
    return isAuthenticated();
  }
}
