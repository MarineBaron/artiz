import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuth) {
      const url = route.url;
      // modifier un profil
      if (url.length === 3 && url[0].path === 'user' && url[2].path === 'edit') {
        if (this.authService.user.role === 'admin') {
          return true;
        }
        if (+ url[1].path === this.authService.user.id) {
          return true;
        }
        return false;
      }
      // ajouter un projet
      if (url.length === 2 && url[0].path === 'projects' && url[1].path === 'edit') {
        if (this.authService.user.role === 'admin' || this.authService.user.role === 'artisan') {
          return true;
        }
        return false;
      }
      // modifier un projet
      if (url.length === 3 && url[0].path === 'project') {
        if (this.authService.user.role === 'admin') {
          return true;
        }
        if (this.authService.user.role === 'artisan') {
          return true;
        }
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
}
