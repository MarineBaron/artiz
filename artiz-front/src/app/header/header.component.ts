import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../services/auth.service';

import User from '../models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuth: boolean;
  isAuthSubscription: Subscription;
  user: User;
  userSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.user = new User();
    this.isAuthSubscription = this.authService.isAuthSubject.subscribe(
      (isAuth) => {
        this.isAuth = isAuth;
      }
    );
    this.userSubscription = this.authService.userSubject.subscribe(
      (user) => {
        this.user = user;
      }
    );
  }

  ngOnDestroy() {
    if (this.isAuthSubscription) {
      this.isAuthSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onSignOut() {
    this.authService.signOut();
    this.router.navigate(['']);
  }

}
