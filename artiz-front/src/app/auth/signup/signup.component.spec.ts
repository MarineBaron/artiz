import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Component, DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

class FakeAuthService {
  signUp(username: string, email: string, password: string, role: string) {
    if (username === 'testCredentialOK') {
      return of({success: true});
    } else if (username === 'testDuplicateName') {
      return of({error: {name: 'SequelizeUniqueConstraintError'}});
    } else if (username === 'testSuccessFalse') {
      return of({success: false});
    } else {
      return (throwError('error in HttpClient'));
    }
  }
}

class FakeRouter {
  navigate(url: [string]) { return url; }
}

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  let authService: FakeAuthService;
  let router: FakeRouter;

  let username: HTMLInputElement;
  let email: HTMLInputElement;
  let password: HTMLInputElement;
  let role: HTMLSelectElement;
  let button: HTMLButtonElement;
  let errorMessage: HTMLElement;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      declarations: [
        SignupComponent
      ],
      providers: [
        { provide: Router,      useClass: FakeRouter },
        { provide: AuthService, useClass: FakeAuthService }
      ]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.debugElement.componentInstance;
    username = fixture.nativeElement.querySelector('#username');
    email = fixture.nativeElement.querySelector('#email');
    password = fixture.nativeElement.querySelector('#password');
    role = fixture.nativeElement.querySelector('#role');
    button = fixture.nativeElement.querySelector('button');
    errorMessage = fixture.nativeElement.querySelector('p.text-danger');
    fixture.detectChanges();
  }));

  it('should create the signup form', async(() => {
    expect(component).toBeTruthy();
  }));
  describe('after initform', () => {
    it('form invalid afterInit init', () => {
      expect(username.value).toBe('', 'username must be empty');
      expect(password.value).toBe('', 'password must be empty');
      expect(email.value).toBe('', 'email must be empty');
      expect(role.value).toBe('', 'role must be empty');
      expect(button.disabled).toBe(true, 'button must be disabled');
    });
  });
  describe('should disable button if form is not valid', () => {
    beforeEach(async(() => {
      username.value = 'Test';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      password.value = 'Password';
      password.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      email.value = 'email@email.fr';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      role.value = role.options[0].value;
      role.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    }));
    it('form valid if all contraints OK', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must be enabled');
    });
    it('form invalid if one element is missing', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must be enabled');

      username.value = '';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

      username.value = 'Test';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      password.value = '';
      password.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

      password.value = 'Password';
      password.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      email.value = '';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

      email.value = 'email@email.fr';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      role.value = '';
      role.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');
    });

    it('form invalid if username length < 3', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must be enabled');

      username.value = 'AA';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

    });

    it('form invalid if password length < 5', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must be enabled');

      password.value = 'AA';
      password.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

    });

    it('form invalid if email not email', () => {
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must be enabled');

      email.value = 'AA';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');

    });
  });
  describe('onSubmit', () => {
    beforeEach(async(() => {
      password.value = 'Password';
      password.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      email.value = 'email@email.fr';
      email.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      role.value = role.options[0].value;
      role.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    }));
    it('shoud redirect to sigin form if form is OK', () => {
      const spy = spyOn(router, 'navigate');

      username.value = 'testCredentialOK';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();
      expect(spy.calls.first().args[0]).toEqual(['auth', 'signin'], 'must be redirect on auth/signin');
    });
    it('shoud display error if duplicate username', () => {
      username.value = 'testDuplicateName';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();
      expect(errorMessage.textContent).toBe('Votre identifiant ou votre email sont déjà utilisés.', 'must display error (duplicate message)');
    });

    it('shoud display error if success false', () => {
      username.value = 'testSuccessFalse';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();
      expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error (standard message)');
    });

    it('shoud display error if server throw error', () => {
      username.value = 'test';
      username.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();
      expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error (standard message)');
    });
  });
});
