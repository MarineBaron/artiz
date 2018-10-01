import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, DebugElement } from '@angular/core';
import { RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

@Component({template: ''})
class BlanckComponent {}

import { HeaderComponent } from './header.component';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { of, throwError } from 'rxjs';
import { RouterLinkDirectiveStub } from '../testing/router-link-directive-stub';

import User from '../models/user.model';

class FakeAuthService {
  private isAuthSubject = new Subject<boolean>();
  private userSubject = new Subject<User>();

  emit(user): void {
    const isAuth = user ? true : false;
    this.isAuthSubject.next(isAuth);
    if (isAuth) {
      this.userSubject.next(new User().deserialize(user));
    } else {
      this.userSubject.next(new User());
    }
  }
}


describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: FakeAuthService;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', component: BlanckComponent },
          { path: 'users', component: BlanckComponent },
          { path: 'projects', component: BlanckComponent },
          { path: 'auth/signin', component: BlanckComponent },
          { path: 'auth/signout', component: BlanckComponent },
          { path: 'user/:id', component: BlanckComponent },
        ]),
        HttpClientTestingModule
      ],
      declarations: [
        HeaderComponent,
        BlanckComponent,
        RouterLinkDirectiveStub
      ],
      providers: [
        { provide: AuthService, useClass: FakeAuthService }
      ]
    }).compileComponents();
    authService = TestBed.get(AuthService);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the header', async(() => {
    expect(component).toBeTruthy();
  }));
  describe('Tests on links', () => {
    let linkDes: DebugElement[];
    let routerLinks: RouterLinkDirectiveStub[];

    describe('When not authenticated', () => {
      it('should display home, signin and signup links', async(() => {
        fixture.detectChanges();
        authService.emit(null);
        fixture.detectChanges();
        linkDes = fixture.debugElement
          .queryAll(By.directive(RouterLinkDirectiveStub));
        routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
        expect(routerLinks.length).toBe(3, 'should have 3 routerLinks');
        expect(routerLinks[0].linkParams).toBe('', 'should have home');
        expect(routerLinks[1].linkParams).toBe('auth/signin', 'should have signin');
        expect(routerLinks[2].linkParams).toBe('auth/signup', 'should have signup');
        expect(routerLinks.find(l => l.linkParams === 'projects')).toBeUndefined('should not have projects');
        expect(routerLinks.find(l => l.linkParams === 'users')).toBeUndefined('should not have users');
        expect(routerLinks.find(l => l.linkParams === 'user/')).toBeUndefined('should not have profile');
      }));
    });
    describe('When authenticated', () => {
      it('should display home, profile, projects and signout links', async(() => {
        const user = {
          id: 10,
          username: 'test',
          role: 'test'
        };
        fixture.detectChanges();
        authService.emit(user);
        fixture.detectChanges();
        linkDes = fixture.debugElement
          .queryAll(By.directive(RouterLinkDirectiveStub));
        routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
        const routerLinksLength = routerLinks.length;
        expect(routerLinksLength).toBeGreaterThan(2, 'should have minimum 3 routerLinks');
        expect(routerLinks.find(l => l.linkParams === '')).toBeDefined('should have home');
        expect(routerLinks.find(l => l.linkParams === 'projects')).toBeDefined('should have projects');
        expect(routerLinks.find(l => l.linkParams === 'user/' + user.id)).toBeDefined('should have profile');
        expect(routerLinks.find(l => l.linkParams === 'auth/signin')).toBeUndefined('should not have signin');
        expect(routerLinks.find(l => l.linkParams === 'auth/signup')).toBeUndefined('should not have signup');
        expect(routerLinks.find(l => l.linkParams === 'users')).toBeUndefined('should not have users');
        const links = fixture.debugElement.nativeElement.querySelectorAll('a');
        const lastLink = links[links.length - 1];
        const spy = spyOn(component, 'onSignOut').and.returnValue(0);
        lastLink.click();
        expect(spy.calls.any()).toBe(true, 'singOut must exists');
      }));
      it('as admin : should display users links', async(() => {
        const user = {
          id: 10,
          username: 'test',
          role: 'admin'
        };
        fixture.detectChanges();
        authService.emit(user);
        fixture.detectChanges();
        linkDes = fixture.debugElement
          .queryAll(By.directive(RouterLinkDirectiveStub));
        routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
        const routerLinksLength = routerLinks.length;
        expect(routerLinksLength).toBeGreaterThan(3, 'should have minimum 4 routerLinks');
        expect(routerLinks.find(l => l.linkParams === 'users')).toBeDefined('should have users');
      }));
    });
  });
  afterEach(() => {
     component.ngOnDestroy();
  });
});
