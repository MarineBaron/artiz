import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

import User from '../../models/user.model';
import Project from '../../models/project.model';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit, OnDestroy {

  title: string;
  isNew: boolean;
  isAuthEdit = false;
  user: User = new User();
  clients: User[] = [];
  artisans: User[] = [];
  project: Project;
  projectSubscription: Subscription;
  projectForm: FormGroup;
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.project = new Project();
    this.isNew = this.route.snapshot.url[0].path === 'projects';
    this.projectSubscription = this.projectService.projectSubject.subscribe(
      (project) => {
        this.project = project;
        this.projectForm.patchValue({
          name: this.project.name,
          artisan: this.project.artisan.id,
          client: this.project.client.id
        });
        this.setIsAuthEdit();
      }
    );

    this.title = this.isNew ? 'Créer un projet' : 'Modifier un projet';
    this.user = this.authService.user;
    this.getOptions();
    this.initForm();
    if (this.isNew) {
      if (this.user.role === 'artisan') {
        this.project.artisan = this.user;
      } else if (this.user.role === 'client') {
        this.project.client = this.user;
      }
      this.project.products = [];
    } else {
      this.getProject();
    }
    this.setIsAuthEdit();
  }

  getProject() {
    const id = this.route.snapshot.paramMap.get('id');
    this.projectService.projectGet(+ id).subscribe();
  }

  initForm() {
    let controls;
    if (this.isNew) {
      controls = {
        name: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{3,}/)]],
        artisan: [this.user.role === 'artisan' ? this.user.id : '', [Validators.required]],
        client: [this.user.role === 'client' ? this.user.id : '', [Validators.required]]
      };
    } else {
      controls = {
        name: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{3,}/)]],
      };
    }
    this.projectForm = this.formBuilder.group(controls);
  }

  onSubmit() {
    let formValues;
    if (this.isNew) {
      formValues = {
        id: null,
        name: this.projectForm.get('name').value,
        artisan: this.user.role === 'artisan' ? this.project.artisan.id : + this.projectForm.get('artisan').value,
        client: this.user.role === 'client' ? this.project.client.id : + this.projectForm.get('client').value,
      };
    } else {
      formValues = {
        id: this.project.id,
        name: this.projectForm.get('name').value,
      };
    }
    if (this.isNew) {
      this.projectService.projectCreate(formValues).subscribe(
        (result: any) => {
          if (result.success) {
            this.router.navigate(['/project', result.data.id]);
          } else {
            this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre projet.';
          }
        },
        (error) => {
          this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre projet.';
        }
      );
    } else {
      this.projectService.projectUpdate(formValues).subscribe(
        (result: any) => {
          if (result.success) {
            this.router.navigate(['/project', this.project.id]);
          } else {
            this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre projet.';
          }
        },
        (error) => {
          this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre projet.';
        }
      );
    }
  }

  getOptions() {
    this.authService.userByRoleList('artisan').subscribe(
      (users) => {
        this.artisans = users;
      }
    );
    this.authService.userByRoleList('client').subscribe(
      (users) => {
        this.clients = users;
      }
    );
    if (this.user.role === 'artisan') {
      this.artisans = this.artisans.filter(u => u.id = this.user.id);
    }
    if (this.user.role === 'client') {
      this.clients = this.clients.filter(u => u.id = this.user.id);
    }
  }

  productsCreate() {
    this.projectService.productsCreate();
  }

  setIsAuthEdit() {
    this.isAuthEdit = this.project && this.project.artisan && (this.user.role === 'admin'
      || this.project.artisan.id === this.user.id);
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }


}
