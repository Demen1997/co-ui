import {Component} from '@angular/core';
import {destroyTokens} from '../core/service/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  constructor(private router: Router) {
  }

  logout() {
    destroyTokens();
    this.router.navigate(['login']);
  }
}
