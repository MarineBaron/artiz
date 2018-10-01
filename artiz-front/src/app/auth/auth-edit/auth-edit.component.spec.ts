import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Component, DebugElement } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthEditComponent } from './auth-edit.component';

import { AuthService } from '../../services/auth.service';

import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { FakeRouter } from '../../testing/fake-router';

import User from '../../models/user.model';

import { mockUsers } from '../../testing/mock-users';

class FakeAuthService {
  user: User;

  setUser(user: User): void {
    this.user = user;
  }

  userGet(id: number) {
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throwError('no user');
    }
    return of(user);
  }
  userUpdate(user) { }
}

describe('AuthEditComponent', () => {
  let component: AuthEditComponent;
  let fixture: ComponentFixture<AuthEditComponent>;

  let authService: FakeAuthService;
  let router: FakeRouter;

  let element: HTMLElement;
  let username: HTMLInputElement;
  let name: HTMLInputElement;
  let email: HTMLInputElement;
  let password: HTMLInputElement;
  let erpapikey: HTMLInputElement;
  let button: HTMLButtonElement;
  let errorMessage: HTMLElement;

  let route: ActivatedRouteStub;

  beforeEach(() => {
    route = new ActivatedRouteStub({ id: 1 });
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      declarations: [
        AuthEditComponent
      ],
      providers: [
        { provide: Router,      useClass: FakeRouter },
        { provide: AuthService, useClass: FakeAuthService },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    fixture = TestBed.createComponent(AuthEditComponent);
    component = fixture.debugElement.componentInstance;
    element = fixture.nativeElement;
    username = element.querySelector('#username');
    name = element.querySelector('#name');
    email = element.querySelector('#email');
    erpapikey = element.querySelector('#erpapikey');
    password = element.querySelector('#password');
    button = element.querySelector('button');
    errorMessage = element.querySelector('p.text-danger');
  }));

  it('should create the user edit component', async(() => {
    expect(component).toBeTruthy();
  }));
  describe('onInit as admin', () => {
    beforeEach(() => {
      authService.setUser(mockUsers[0]);
    });
    describe('should display profile edit page (admin)', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[0].id});
        fixture.detectChanges();
      }));
      it('should create the user detail component', () => {
        expect(component).toBeTruthy();
      });
      it('should contains user\'s informations', () => {
        expect(username.value).toBe(mockUsers[0].username, 'username input should contain username');
        expect(name.value).toBe(mockUsers[0].name, 'name input should contain name');
        expect(email.value).toBe(mockUsers[0].email, 'email input should contain email');
        expect(password.value).toBe('', 'password should be empty');
        expect(button.disabled).toBeFalsy();
      });
      it('should be invalid if username is not valid (required, length > 3)', async(() => {
        username.value = 'aa';
        username.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(button.disabled).toBeTruthy();
      }));
      it('should be invalid if email is not valid (required, format email)', async(() => {
        email.value = 'aa';
        email.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(button.disabled).toBeTruthy();
      }));
      it('should be valid if name is empty', async(() => {
        name.value = '';
        name.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(button.disabled).toBeFalsy();
      }));
      it('should be valid if password is empty', async(() => {
        password.value = '';
        password.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(button.disabled).toBeFalsy();
      }));
    });
    describe('should display profile edit page (artisan)', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[1].id});
        fixture.detectChanges();
      }));
      it('should contains erpakikey', () => {
        erpapikey = element.querySelector('#erpapikey');
        expect(erpapikey.value).toBe(mockUsers[1].erpapikey, 'erpakikey input should contain erpapikey');
        expect(button.disabled).toBeFalsy();
      });
    });
    describe('onSubmit', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[0].id});
        fixture.detectChanges();
      }));
      it('should save and navigate to user page', async(() => {
        const spyRedirect = spyOn(router, 'navigate');
        const spyUpdate = spyOn(authService, 'userUpdate').and.returnValue(of({success: true, data: {id: mockUsers[0].id}}));
        button.click();
        fixture.detectChanges();
        expect(spyUpdate).toHaveBeenCalled();
        fixture.detectChanges();
        expect(spyRedirect).toHaveBeenCalled();
        expect(spyRedirect.calls.first().args[0]).toEqual(['user', mockUsers[0].id], 'must be redirect to user view');
      }));
      it('should get error after save and display error (duplicate)', async(() => {
        const spyUpdate = spyOn(authService, 'userUpdate')
          .and.returnValue(of({success: false, error: { name: 'SequelizeUniqueConstraintError'}}));
        button.click();
        fixture.detectChanges();
        expect(spyUpdate).toHaveBeenCalled();
        fixture.detectChanges();
        expect(errorMessage.textContent).toBe('l\'identifiant ou l\'email sont déjà utilisés.', 'must display error message (duplicate)');
      }));
      it('should get error after save display error (other)', async(() => {
        const spyUpdate = spyOn(authService, 'userUpdate')
          .and.returnValue(of({success: false}));
        button.click();
        fixture.detectChanges();
        expect(spyUpdate).toHaveBeenCalled();
        fixture.detectChanges();
        expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error message (other)');
      }));
      it('should get error after save display error (throwError)', async(() => {
        const spyUpdate = spyOn(authService, 'userUpdate')
          .and.returnValue(throwError('error'));
        button.click();
        fixture.detectChanges();
        expect(spyUpdate).toHaveBeenCalled();
        fixture.detectChanges();
        expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error message (other)');
      }));
    });
  });
});
