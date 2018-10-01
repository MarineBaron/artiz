import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

import { Component, DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthListComponent } from './auth-list.component';

import { AuthService } from '../../services/auth.service';

import { RouterLinkDirectiveStub } from '../../testing/router-link-directive-stub';
import { FakeRouter } from '../../testing/fake-router';

import User from '../../models/user.model';

import { mockUsers } from '../../testing/mock-users';

@Component({template: ''})
class BlanckComponent {}

class FakeAuthService {
  user: User;

  userList() {
    return of(mockUsers);
  }
}

describe('AuthListComponent', () => {
  let component: AuthListComponent;
  let fixture: ComponentFixture<AuthListComponent>;

  let authService: FakeAuthService;

  let element: HTMLElement;
  let rows: NodeListOf<HTMLTableRowElement>;

  let linkDes: DebugElement[];
  let routerLinks: RouterLinkDirectiveStub[];


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'user/:id', component: BlanckComponent }
        ]),
        HttpClientTestingModule
      ],
      declarations: [
        AuthListComponent,
        BlanckComponent ,
        RouterLinkDirectiveStub
      ],
      providers: [
        { provide: AuthService, useClass: FakeAuthService },
      ]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    fixture = TestBed.createComponent(AuthListComponent);
    component = fixture.debugElement.componentInstance;
    element = fixture.nativeElement;
  }));

  it('should create the user detail component', async(() => {
    expect(component).toBeTruthy();
  }));
  describe('onInit as admin', () => {
    beforeEach(() => async(() => {
      fixture.detectChanges();
    }));
    it('should display all users', async(() => {
      fixture.detectChanges();
      rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(mockUsers.length, 'must display one line / user');
    }));
    it('should display username, name, email and role', async(() => {
      fixture.detectChanges();
      rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows[0].textContent).toContain(mockUsers[0].username, 'must display username');
      expect(rows[0].textContent).toContain(mockUsers[0].name, 'must display name');
      expect(rows[0].textContent).toContain(mockUsers[0].email, 'must display email');
      expect(rows[0].textContent).toContain(mockUsers[0].role, 'must display role');
    }));
    it('should display links to users', async(() => {
      fixture.detectChanges();
      linkDes = fixture.debugElement
        .queryAll(By.directive(RouterLinkDirectiveStub));
      routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
      expect(routerLinks[0].linkParams).toBe(`/user/${mockUsers[0].id}`, 'should have links to user');
    }));
  });
});
