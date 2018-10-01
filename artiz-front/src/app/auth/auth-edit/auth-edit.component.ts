import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';

import User from '../../models/user.model';

@Component({
  selector: 'app-auth-edit',
  templateUrl: './auth-edit.component.html',
  styleUrls: ['./auth-edit.component.scss']
})
export class AuthEditComponent implements OnInit {
  title = 'Modifier un utilisateur';
  user: User;
  userForm: FormGroup;
  errorMessage: string;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.getUser(params.get('id'));
      })
    ).subscribe(
      (user: User) => {
        this.user = user;
        this.userForm.patchValue({
          username: this.user.username,
          name: this.user.name,
          email: this.user.email,
          erpapikey: this.user.erpapikey
        });
      }
    );
  }

  getUser(id: string) {
    return this.authService.userGet(+ id);
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{3,}/)]],
      email: ['', [Validators.required, Validators.email]],
      name: [''],
      erpapikey: [''],
      password: ['',  [Validators.pattern(/[0-9a-zA-Z]{5,}/)]]
    });
  }

  onSubmit() {
    this.user.username = this.userForm.get('username').value;
    this.user.name = this.userForm.get('name').value;
    this.user.email = this.userForm.get('email').value;
    this.user.erpapikey = this.userForm.get('erpapikey').value;

    const user = {
      id: this.user.id,
      role: this.user.role,
      username: this.userForm.get('username').value,
      name: this.userForm.get('name').value,
      email: this.userForm.get('email').value,
      erpapikey: this.userForm.get('erpapikey').value,
      password: this.userForm.get('password').value
    };

    this.authService.userUpdate(user).subscribe(
      (result) => {
        if (result.success) {
          this.router.navigate(['user', result.data.id]);
        } else {
          if (result.error && result.error.name && result.error.name === 'SequelizeUniqueConstraintError') {
            this.errorMessage = 'l\'identifiant ou l\'email sont déjà utilisés.';
          } else {
            this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
          }
        }
      },
      (error) => {
        this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
      }
    );
  }
}
