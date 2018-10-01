import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

import ArtizServerResponse from '../models/artiz-server-response.model';
import User from '../models/user.model';

import { mockUsers } from '../testing/mock-users';
const expectedUser = mockUsers[1];

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [AuthService],
      });

      service = TestBed.get(AuthService);
      httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('checkAuth', () => {
    it('should fields service.user', () => {
      service.checkAuth().subscribe(
        () => {
          expect(service.isAuth).toBeTruthy();
          expect(service.user).toEqual(expectedUser);
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/auth/check`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        data: expectedUser
      });
    });
    it('should not fields service.user', () => {
      service.checkAuth().subscribe(
        () => {
          expect(service.isAuth).toBeFalsy();
          expect(service.user).toBeUndefined();
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/auth/check`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: false,
        error: {
          message: 'disconnect'
        }
      });
    });
  });

  describe('signUp', () => {
    it('should return response', () => {
      const sendData = {
        username: expectedUser.username,
        email: expectedUser.email,
        password: 'xxx',
        role: expectedUser.role
      };
      const data = {
        success: true,
        data:  {
          username: expectedUser.username,
          email: expectedUser.email,
          role: expectedUser.role
        }
      };
      service.signUp(expectedUser.username, expectedUser.email, 'xxx', expectedUser.role).subscribe(
        (res: any) => {
          expect(res).toEqual(data);
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/auth/signup`, 'call to api');
      expect(req.request.method).toBe('POST');

      req.flush(data);
    });
  });

  describe('signIn', () => {
    it('should return success response and set session', () => {
      const sendData = {
        username: expectedUser.username,
        password: 'xxx'
      };
      const data = {
        success: true,
        data: expectedUser
      };
      service.signIn(expectedUser.username, 'xxx').subscribe(
        (res: any) => {
          expect(res).toEqual(data);
          expect(service.isAuth).toBeTruthy();
          expect(service.user.username).toBe(expectedUser.username, 'serivice user.username should be expetedUser.username');
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/auth/signin`, 'call to api');
      expect(req.request.method).toBe('POST');

      req.flush(data);
    });
    it('should return not success response and signOut', () => {
      const sendData = {
        username: expectedUser.username,
        password: 'xxx'
      };
      const data = {
        success: false,
        error: 'error'
      };
      service.signIn(expectedUser.username, 'xxx').subscribe(
        (res: any) => {
          expect(res.success).toEqual(data.success);
          expect(res.error).toBeDefined();
          expect(service.isAuth).toBeFalsy();
          expect(service.user).toEqual(new User());
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/auth/signin`, 'call to api');
      expect(req.request.method).toBe('POST');

      req.flush(data);
    });
  });

  describe('signOut', () => {
    it('should disconnect', () => {
      service.signOut();
      expect(service.isAuth).toBeFalsy();
      expect(service.user).toEqual(new User());
    });
  });

  describe('setSession', () => {
    it('should set Session', () => {
      service.setSession(expectedUser);
      expect(service.isAuth).toBeTruthy();
      expect(service.user.username).toBe(expectedUser.username, 'serivice user.username should be expetedUser.username');
    });
  });

  describe('userGet', () => {
    it('should get successful response', () => {
      service.userGet(expectedUser.id).subscribe(
        (user: User) => {
          expect(user.name).toBe(expectedUser.name);
          expect(user.username).toBe(expectedUser.username);
        },
        fail
      );

      const req = httpMock.expectOne(`${service.apiUrl}/user/user/${expectedUser.id}`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        data: expectedUser
      });
    });
    it('should get error response (deliberate 404 error)', () => {
      const emsg = 'deliberate 404 error';

      service.userGet(expectedUser.id).subscribe(
        (user: User) => fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.status).toEqual(404, 'status');
          expect(error.error).toEqual(emsg, 'message');
        }
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/user/${expectedUser.id}`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });
    it('should get error response (simulated network error)', () => {
      const emsg = 'simulated network error';

      service.userGet(expectedUser.id).subscribe(
        (user: User) => fail('should have failed with the network error'),
        (error: HttpErrorResponse) => {
          expect(error.error.message).toEqual(emsg, 'message');
        }
      );

      const req = httpMock.expectOne(`${service.apiUrl}/user/user/${expectedUser.id}`, 'call to api');
      expect(req.request.method).toBe('GET');

      const mockError = new ErrorEvent('Network error', {
        message: emsg,
      });
      req.error(mockError);
    });
    it('should get error response (custom error)', () => {
      const emsg = 'custom error';

      service.userGet(expectedUser.id).subscribe(
        (res) => {
          fail('should have failed with the network error');
        },
        (error: Error) => {
          expect(error.message).toBe(emsg);
        }
      );

      const req = httpMock.expectOne(`${service.apiUrl}/user/user/${expectedUser.id}`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: false,
        error: {
          message: emsg
        }
      });
    });
  });

  describe('userList', () => {
    it('should send success response and return users', () => {
      service.userList().subscribe(
        (users: User[]) => {
          expect(users).toEqual(mockUsers);
        },
        fail
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/users`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        data: mockUsers
      });
    });
    it('should send not success response and return users', () => {
      service.userList().subscribe(
        (users: User[]) => {
          expect(users).toEqual([]);
        },
        fail
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/users`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: false,
        error: 'custom error'
      });
    });
  });

  describe('userByRoleList', () => {
    it('should send success response and return users', () => {
      const usersByRole = mockUsers.filter(u => u.role === 'artisan');

      service.userList().subscribe(
        (users: User[]) => {
          expect(users).toEqual(usersByRole);
        },
        fail
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/users`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: true,
        data: usersByRole
      });
    });
    it('should send not success response and return users', () => {
      service.userList().subscribe(
        (users: User[]) => {
          expect(users).toEqual([]);
        },
        fail
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/users`, 'call to api');
      expect(req.request.method).toBe('GET');

      req.flush({
        success: false,
        error: 'custom error'
      });
    });
  });

  describe('userUpdate', () => {
    let userAuthenticated;
    let userUpdated;
    describe('userAuthenticated is not userUpdated', () => {
      beforeEach(() => {
        userAuthenticated = mockUsers[0];
        service.user = userAuthenticated;
        service.isAuth = true;
        userUpdated = mockUsers[1];
      });
      it('should send success response and not change service.user', () => {
        const data = {
          success: true,
          data: userUpdated
        };

        service.userUpdate(userUpdated).subscribe(
          (res: any) => {
            expect(res).toEqual(data);
            expect(service.user.username).toBe(userAuthenticated.username, 'should not change userAuthenticated');
          },
          fail
        );
        const req = httpMock.expectOne(`${service.apiUrl}/user/user/${userUpdated.id}`, 'call to api');
        expect(req.request.method).toBe('PUT');

        req.flush(data);
      });
      it('should send NOT success response and not change service.user', () => {
        const data = {
          success: false,
          data: userUpdated,
          error: 'custom error'
        };

        service.userUpdate(userUpdated).subscribe(
          (res: any) => {
            expect(res).toEqual(data);
            expect(service.user.username).toBe(userAuthenticated.username, 'should not change userAuthenticated');
          },
          fail
        );
        const req = httpMock.expectOne(`${service.apiUrl}/user/user/${userUpdated.id}`, 'call to api');
        expect(req.request.method).toBe('PUT');

        req.flush(data);
      });
    });
    describe('userAuthenticated is userUpdated', () => {
      beforeEach(() => {
        userAuthenticated = mockUsers[0];
        service.user = userAuthenticated;
        service.isAuth = true;
        userUpdated = mockUsers[0];
      });
      it('should send success response and change service.user username', () => {
        const updatedUsername = 'testUsername';
        userUpdated.username = updatedUsername;
        const data = {
          success: true,
          data: userUpdated
        };

        service.userUpdate(userUpdated).subscribe(
          (res: any) => {
            expect(res).toEqual(data);
            expect(service.user.username).toBe(updatedUsername, 'should change userAuthenticated');
          },
          fail
        );
        const req = httpMock.expectOne(`${service.apiUrl}/user/user/${userUpdated.id}`, 'call to api');
        expect(req.request.method).toBe('PUT');

        req.flush(data);
      });
      it('should send NOT success response and disconnect user', () => {
        const updatedUsername = 'testUsername';
        userUpdated.username = updatedUsername;
        const data = {
          success: false,
          data: userUpdated,
          error: 'custom error'
        };

        service.userUpdate(userUpdated).subscribe(
          (res: any) => {
            expect(res).toEqual(data);
            expect(service.isAuth).toBeFalsy();
            expect(service.user).toEqual(new User(), 'should fill user with empty');
          },
          fail
        );
        const req = httpMock.expectOne(`${service.apiUrl}/user/user/${userUpdated.id}`, 'call to api');
        expect(req.request.method).toBe('PUT');

        req.flush(data);
      });
    });
  });

  describe('userDelete', () => {
    let userAuthenticated;
    let userDeleted;
    beforeEach(() => {
      userAuthenticated = mockUsers[0];
      service.user = userAuthenticated;
      service.isAuth = true;
      userDeleted = mockUsers[1];
    });
    it('should send res response', () => {
      const data = {
        success: true
      };

      service.userDelete(userDeleted.id).subscribe(
        (res: any) => {
          expect(res).toEqual(data);
        },
        fail
      );
      const req = httpMock.expectOne(`${service.apiUrl}/user/user/${userDeleted.id}`, 'call to api');
      expect(req.request.method).toBe('DELETE');

      req.flush(data);
    });
  });
});
