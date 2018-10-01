import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { Component, DebugElement } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthDetailComponent } from './auth-detail.component';

import { AlertsService } from 'angular-alert-module';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

import { RouterLinkDirectiveStub } from '../../testing/router-link-directive-stub';
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

  userDelete(id: number) {
    return of(true);
  }
}

class FakeProjectService {
  projects = [];

  projectList(user: User) {
    if (user.id === 3) {
      this.projects = ['projects'];
      return of(null);
    } else {
      return of(null);
    }
  }
}

describe('AuthDetailComponent', () => {
  let component: AuthDetailComponent;
  let fixture: ComponentFixture<AuthDetailComponent>;

  let alertsService: AlertsService;
  let authService: FakeAuthService;
  let projectService: FakeProjectService;
  let router: FakeRouter;

  let element: HTMLElement;

  let route: ActivatedRouteStub;
  let linkDes: DebugElement[];
  let routerLinks: RouterLinkDirectiveStub[];

  beforeEach(() => {
    route = new ActivatedRouteStub({ id: 1 });
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        AuthDetailComponent,
        RouterLinkDirectiveStub
      ],
      providers: [
        AlertsService,
        { provide: Router,      useClass: FakeRouter },
        { provide: AuthService, useClass: FakeAuthService },
        { provide: ProjectService, useClass: FakeProjectService },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();
    alertsService = TestBed.get(AlertsService);
    authService = TestBed.get(AuthService);
    projectService = TestBed.get(ProjectService);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    fixture = TestBed.createComponent(AuthDetailComponent);
    component = fixture.debugElement.componentInstance;
    element = fixture.nativeElement;
  }));

  it('should create the user detail component', async(() => {
    expect(component).toBeTruthy();
  }));
  describe('onInit as admin', () => {
    beforeEach(() => {
      authService.setUser(mockUsers[0]);
    });
    describe('should display profile', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[0].id});
        fixture.detectChanges();
      }));
      it('should create the user detail component', async(() => {
        expect(component).toBeTruthy();
      }));
      it('should contains user\'s informations', async(() => {
        expect(element.textContent).toContain(mockUsers[0].name, 'should contain name');
        expect(element.textContent).toContain(mockUsers[0].username, 'should contain username');
        expect(element.textContent).toContain(mockUsers[0].email, 'should contain email');
        expect(element.textContent).toContain(mockUsers[0].role, 'should contain role');
      }));
      it('should contains edit button and redirect to edit page', async(() => {
        linkDes = fixture.debugElement
          .queryAll(By.directive(RouterLinkDirectiveStub));
        routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
        const spy = spyOn(router, 'navigate');
        const editBtn = element.querySelector('button.btn-primary');
        expect(editBtn).toBeDefined('Edit button should be defined');
        expect(routerLinks.find(l => l.linkParams === 'edit')).toBeDefined('should have edit links');
      }));
      it('should not contains delete button', async(() => {
        expect(element.querySelector('button.btn-danger')).toBeNull();
      }));
    });
    describe('should display artisan profile (without project)', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[1].id});
        fixture.detectChanges();
      }));
      it('should create the user detail component', async(() => {
        expect(component).toBeTruthy();
      }));
      it('should contains user\'s informations', async(() => {
        expect(element.textContent).toContain(mockUsers[1].name, 'should contain name');
        expect(element.textContent).toContain(mockUsers[1].username, 'should contain username');
        expect(element.textContent).toContain(mockUsers[1].email, 'should contain email');
        expect(element.textContent).toContain(mockUsers[1].role, 'should contain role');
      }));
      it('should contains erpapikey', async(() => {
        expect(element.textContent).toContain(mockUsers[1].erpapikey, 'should contain erpapikey');
      }));
      it('should contains edit button and redirect to edit page', async(() => {
        linkDes = fixture.debugElement
          .queryAll(By.directive(RouterLinkDirectiveStub));
        routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
        const editBtn = element.querySelector('button.btn-primary');
        expect(editBtn).toBeDefined('Edit button should be defined');
        expect(routerLinks.find(l => l.linkParams === 'edit')).toBeDefined('should have edit links');
      }));
      it('should contains delete button', async(() => {
        const spyRouter = spyOn(router, 'navigate');
        const spyAlerts = spyOn(alertsService, 'setMessage');
        const btnDelete: HTMLButtonElement = element.querySelector('button.btn-danger');
        expect(btnDelete).toBeDefined();
        btnDelete.click();
        fixture.detectChanges();
        expect(spyAlerts.calls.first().args[1]).toBe('success', 'must display success message');
        expect(spyRouter.calls.first().args[0]).toEqual(['users'], 'must be redirect on users after delete');
      }));
    });
    describe('should display artisan profile (with project)', () => {
      beforeEach(async(() => {
        route.setParamMap({id: mockUsers[2].id});
        fixture.detectChanges();
      }));
      it('should contains delete button but can\'t delete', async(() => {
        const spyRouter = spyOn(router, 'navigate');
        const spyAlerts = spyOn(alertsService, 'setMessage');
        const spyDelete = spyOn(authService, 'userDelete');
        const btnDelete: HTMLButtonElement = element.querySelector('button.btn-danger');
        expect(btnDelete).toBeDefined();
        btnDelete.click();
        fixture.detectChanges();
        expect(spyAlerts.calls.first().args[1]).toBe('error', 'must display error message');
        expect(spyDelete).not.toHaveBeenCalled();
      }));
    });
    describe('should not display inexistant user', () => {
      beforeEach(async(() => {
        route.setParamMap({id: 4});
        fixture.detectChanges();
      }));
      it('should not display user', async(() => {
        // no Identifdiant
        expect(element.textContent).not.toContain('Identifiant', 'should not contain identifiant');
        // no buttons
        const btnDelete: HTMLButtonElement = element.querySelector('button.btn-danger');
        const btnEdit: HTMLButtonElement = element.querySelector('button.btn-primary');
        expect(btnDelete).toBeNull();
        expect(btnEdit).toBeNull();
      }));
      xit('should display error message', async(() => {
        // message
        const spyAlerts = spyOn(alertsService, 'setMessage');
        expect(spyAlerts.calls.first().args[1]).toBe('error', 'must display error message');
      }));
    });
  });
});
