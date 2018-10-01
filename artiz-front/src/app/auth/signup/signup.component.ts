import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  title: 'Créer un compte';
  signUpForm: FormGroup;
  errorMessage: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.signUpForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{3,}/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{5,}/)]],
      role: ['', [Validators.required]]
    });
  }

  onSubmit() {
    const username = this.signUpForm.get('username').value;
    const email = this.signUpForm.get('email').value;
    const password = this.signUpForm.get('password').value;
    const role = this.signUpForm.get('role').value;

    this.authService.signUp(username, email, password, role).subscribe(
      (result) => {
        if (result.success) {
          this.router.navigate(['auth', 'signin']);
        } else {
          if (!result.error) {
            this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
          } else if (result.error.name && result.error.name === 'SequelizeUniqueConstraintError') {
            this.errorMessage = 'Votre identifiant ou votre email sont déjà utilisés.';
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
