import { Component, OnInit } from '@angular/core';

import { environment } from '../environments/environment';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'artiz';
  apiUrl: string = environment.artixApi.url;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.checkAuth().subscribe();
  }

}
