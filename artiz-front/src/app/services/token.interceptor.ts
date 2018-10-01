import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { environment } from '../../environments/environment';

import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.search(environment.artixApi.url) !== -1) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      });
    } else if (request.url.search(environment.dolibarrApi.url) !== -1) {
      request = request.clone({
        setHeaders: {
          DOLAPIKEY: this.authService.getErpapikey()
        }
      });
    }

    return next.handle(request);
  }
}
