import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

import User from '../../models/user.model';

@Component({
  selector: 'app-auth-list',
  templateUrl: './auth-list.component.html',
  styleUrls: ['./auth-list.component.scss']
})
export class AuthListComponent implements OnInit {

  title = 'Utilisateurs';
  users: User[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.userList().subscribe(
      (users) => {
        this.users = users;
      }
    );
  }
}
