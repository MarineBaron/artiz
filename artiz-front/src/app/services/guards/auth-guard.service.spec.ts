import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from '../auth.service';

import User from '../../models/user.model';

import { mockUsers } from '../../testing/mock-users';

class FakeAuthService {
  isAuth = false;
  user = new User();

  setUser(user: User) {
    this.user = user;
    this.isAuth = true;
  }
}

describe('AuthGuardService', () => {
  let mockSnapshot;
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [
          RouterTestingModule
        ],
        providers: [
          AuthGuardService,
          { provide: AuthService, useClass: FakeAuthService },
        ],
    });
    mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', ['toString']);
  });

  it('should prevent non-authenticated access',
    async(inject([AuthGuardService, AuthService, Router], (guard: AuthGuardService, auth: FakeAuthService, router: Router) => {
    mockSnapshot.url = '/protected';
    expect(guard.canActivate(null, mockSnapshot)).toBeFalsy();
  })));

});


