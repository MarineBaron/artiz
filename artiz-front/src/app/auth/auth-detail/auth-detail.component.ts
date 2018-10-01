import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { of } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { switchMap, tap } from 'rxjs/operators';

import { AlertsService } from 'angular-alert-module';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

import User from '../../models/user.model';

@Component({
  selector: 'app-auth-detail',
  templateUrl: './auth-detail.component.html',
  styleUrls: ['./auth-detail.component.scss']
})
export class AuthDetailComponent implements OnInit {
  title = 'Détail d\'un utilisateur';
  user: User;
  isAuthEdit = false;
  isAuthDelete = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private projectService: ProjectService,
    private alerts: AlertsService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.getUser(params.get('id'));
      })
    ).subscribe(
      (user: User) => {
        if (!user) {
          this.alerts.setMessage('Cet utilisateur n\'existe pas', 'error');
        }
        this.user = user;
        this.setIsAuthEdit();
        this.setIsAuthDelete();
      },
      (error) => {
        this.alerts.setMessage('Cet utilisateur n\'existe pas', 'error');
        this.user = new User();
        this.setIsAuthEdit();
        this.setIsAuthDelete();
      }
    );
  }

  getUser(id: string) {
    return this.authService.userGet(+ id);
  }

  onDelete() {
    const id = this.user.id;
    if (this.user.role === 'admin') {
      this.alerts.setMessage('On ne peut supprimer un administrateur', 'error');
    } else {
      this.projectService.projectList(this.user).subscribe(
        (result) => {
          if (this.projectService.projects.length) {
            this.alerts.setMessage('Cet utilisateur possède des projets, et ne peut etre supprimé.', 'error');
          } else {
            this.alerts.setMessage('L\'utilisateur a été supprimé.', 'success');
            this.authService.userDelete(id).subscribe(
              (res) => {
                this.router.navigate(['users']);
              }
            );
          }
        }
      );
    }
  }

  setIsAuthDelete() {
    this.isAuthDelete = this.user && this.authService.user.role === 'admin'
     && this.authService.user.id !== this.user.id;
  }

  setIsAuthEdit() {
    this.isAuthEdit = this.user && (this.authService.user.role === 'admin'
      || this.authService.user.id === this.user.id);
  }
}
