import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Component, DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { SigninComponent } from './signin.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

class FakeAuthService {
  signIn(username: string, password: string) {
    if (username === 'testCredentialOK') {
      return of({success: true});
    } else if (username === 'testCredentialKO') {
      return of({success: false});
    } else {
      return (throwError('error in HttpClient'));
    }
  }
}

class FakeRouter {
  navigate(url: [string]) { return url; }
}

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;

  let authService: FakeAuthService;
  let router: FakeRouter;

  let username: HTMLInputElement;
  let password: HTMLInputElement;
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
        SigninComponent
      ],
      providers: [
        { provide: Router,      useClass: FakeRouter },
        { provide: AuthService, useClass: FakeAuthService }
      ]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.debugElement.componentInstance;
    username = fixture.nativeElement.querySelector('#username');
    password = fixture.nativeElement.querySelector('#password');
    button = fixture.nativeElement.querySelector('button');
    errorMessage = fixture.nativeElement.querySelector('p.text-danger');
    fixture.detectChanges();
  }));

  it('should create the signin form', async(() => {
    expect(component).toBeTruthy();
  }));
  it('form invalid afterInit init', () => {
    expect(username.value).toBe('', 'username must be empty');
    expect(password.value).toBe('', 'password must be empty');
    expect(button.disabled).toBe(true, 'button must be disabled');
  });
  it('form invalid if password or username is empty', () => {
    username.value = 'Test';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    username.value = '';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    password.value = '';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true, 'button must be disabled');
  });
  it('form valid if password or username are both not empty', () => {
    username.value = 'Test';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    password.value = 'Test';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must not be disabled');
  });
  it('redirect to home if authenticate is OK', () => {
    const spy = spyOn(router, 'navigate');
    username.value = 'testCredentialOK';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    password.value = 'Test';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must not be disabled');
    button.click();
    fixture.detectChanges();
    expect(spy.calls.first().args[0]).toEqual([''], 'must be redirect on home');
  });
  it('should display error if credentials are KO', () => {
    username.value = 'testCredentialKO';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    password.value = 'Test';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must not be disabled');
    button.click();
    fixture.detectChanges();
    expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error');
  });
  it('should display error if request throw error', () => {
    username.value = 'Error';
    username.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    password.value = 'Test';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false, 'button must not be disabled');
    button.click();
    fixture.detectChanges();
    expect(errorMessage.textContent).toBe('Une erreur est survenue, veuillez réessayer.', 'must display error');
  });
});
