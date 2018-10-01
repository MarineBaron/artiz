import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  title: 'Connexion';
  signInForm: FormGroup;
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
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    const username = this.signInForm.get('username').value;
    const password = this.signInForm.get('password').value;

    this.authService.signIn(username, password).subscribe(
      (result) => {
        if (result.success) {
          this.router.navigate(['']);
        } else {
          this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
        }
      },
      (error) => {
        this.errorMessage = 'Une erreur est survenue, veuillez réessayer.';
      }
    );
  }
}
