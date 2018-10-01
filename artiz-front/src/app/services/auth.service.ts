import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { of, throwError } from 'rxjs';
import * as moment from 'moment';

import { map, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import ArtizServerResponse from '../models/artiz-server-response.model';
import User from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl: string = environment.artixApi.url;

  isAuthSubject = new Subject<boolean>();
  isAuth = false;
  userSubject = new Subject<User>();
  user: User;
  usersSubject = new Subject<User[]>();
  users: User[] = [];

  constructor(
    private httpClient: HttpClient
  ) { }

  emitAuthSubject(): void {
    this.isAuthSubject.next(this.isAuth);
  }

  emitUserSubject(): void {
    this.userSubject.next(this.user);
  }

  emitUsersSubject(): void {
    this.usersSubject.next(this.users);
  }

  /* ******************************
  /*  Auth Méthods
  /* ******************************/

  checkAuth() {
    return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/auth/check').pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          this.isAuth = true;
          this.user = new User().deserialize(res.data);
          this.emitAuthSubject();
          this.emitUserSubject();
        }
      })
    );
  }

  signUp(username: string, email: string, password: string, role: string) {
    return this.httpClient.post<ArtizServerResponse>(this.apiUrl + '/auth/signup', {
        username: username,
        name: name,
        email: email,
        password: password,
        role: username === 'artiz' ? 'admin' : role
      }).pipe(
        map((res: ArtizServerResponse) => {
          return res;
        }
      )
    );
  }

  signIn(username: string, password: string) {
    return this.httpClient
      .post<ArtizServerResponse>(this.apiUrl + '/auth/signin', {
        username: username,
        password: password,
      }).pipe(
        map((res: ArtizServerResponse) => {
          if (res.success) {
            this.setSession(res.data);
          } else {
            this.signOut();
          }
          return res;
        })
      );
  }

  signOut() {
    localStorage.removeItem('token');
    this.isAuth = false;
    this.user = new User();
    this.emitAuthSubject();
    this.emitUserSubject();
  }

  setSession(authResult) {
    localStorage.setItem('token', authResult.token);
    this.isAuth = true;
    this.user = new User().deserialize(authResult);
    this.emitAuthSubject();
    this.emitUserSubject();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getErpapikey() {
    return this.user.erpapikey;
  }

  getDoliUrl() {
    return environment.dolibarrApi.url + '/' + this.user.username + '/htdocs/api/index.php' ;
  }



  /* ******************************
  /*  CRUD User
  /* ******************************/

  userGet(id: number) {
    return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/user/user/' + id).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success && res.data) {
          return res.data as User;
        } else {
          throw new Error(res.error.message);
        }
      })
    );
  }

  userList() {
    return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/user/users').pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          return res.data.map((u) => new User().deserialize(u));
        } else {
          return [];
        }
      })
    );
  }

  userByRoleList(role: string) {
    return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/user/users/' + role).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          return res.data.map((u) => new User().deserialize(u));
        } else {
          return [];
        }
      })
    );
  }

  userUpdate(user: any) {
    return this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/user/user/' + user.id, user).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          const newUser = res.data;
          if (this.user.id === newUser.id) {
            this.user = new User().deserialize(newUser);
            this.emitAuthSubject();
            this.emitUserSubject();
          }
          res.data = new User().deserialize(newUser);
          return res;
        } else {
          if (this.user.id === res.data.id) {
            this.signOut();
          }
          return res;
        }
      })
    );
  }

  userDelete(id: number) {
    return this.httpClient.delete<ArtizServerResponse>(this.apiUrl + '/user/user/' + id).pipe(
      map((res: ArtizServerResponse) => {
        return res;
      })
    );
  }

  /* ******************************
  /*  Errors on HttpRequest
  /* ******************************/

  // private handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error.message);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong,
  //     console.error(
  //       `Backend returned code ${error.status}, ` +
  //       `body was: ${error.error}`);
  //   }
  //   // return an observable with a user-facing error message
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // };

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
private handleError<T> (operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {

    // TODO: send the error to remote logging infrastructure
    console.error(error); // log to console instead

    // TODO: better job of transforming error for user consumption
    // this.log(`${operation} failed: ${error.message}`);

    // Let the app keep running by returning an empty result.
    return of(result as T);
  };
}
}
