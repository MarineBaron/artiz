import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AlertsModule } from 'angular-alert-module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthListComponent } from './auth/auth-list/auth-list.component';
import { AuthDetailComponent } from './auth/auth-detail/auth-detail.component';
import { AuthEditComponent } from './auth/auth-edit/auth-edit.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';
import { ProductListComponent } from './projects/product-list/product-list.component';

import { TokenInterceptor } from './services/token.interceptor';

import { AuthService } from './services/auth.service';
import { ProjectService } from './services/project.service';
import { AuthGuardService } from './services/guards/auth-guard.service';

const appRoutes: Routes = [
  { path: 'auth/signin', component: SigninComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'users', canActivate: [AuthGuardService], component: AuthListComponent },
  { path: 'user/:id', canActivate: [AuthGuardService], component: AuthDetailComponent },
  { path: 'user/:id/edit', canActivate: [AuthGuardService], component: AuthEditComponent },
  { path: 'projects', canActivate: [AuthGuardService], component: ProjectListComponent },
  { path: 'projects/add', canActivate: [AuthGuardService], component: ProjectEditComponent },
  { path: 'project/:id', canActivate: [AuthGuardService], component: ProjectDetailComponent },
  { path: 'project/:id/edit', canActivate: [AuthGuardService], component: ProjectEditComponent },
  { path: '', component: HomeComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    SigninComponent,
    SignupComponent,
    AuthListComponent,
    AuthDetailComponent,
    AuthEditComponent,
    ProjectListComponent,
    ProjectDetailComponent,
    ProjectEditComponent,
    ProductListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    AlertsModule.forRoot()
  ],
  providers: [
    AuthService,
    ProjectService,
    AuthGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
