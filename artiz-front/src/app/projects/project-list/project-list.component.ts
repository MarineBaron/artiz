import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

import User from '../../models/user.model';
import Project from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {

  title = 'Projets';
  user: User = new User();
  isAuthAdd: boolean;
  projects: Project[] = [];
  projectsSubscription: Subscription;


  constructor(
    private authService: AuthService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.projectsSubscription = this.projectService.projectsSubject.subscribe(
      (projects) => {
        this.projects = projects;
      }
    );
    this.user = this.authService.user;
    this.isAuthAdd = this.user.role === 'admin' || this.user.role === 'artisan';
    this.getProjects();
  }

  getProjects() {
    this.projectService.projectList(this.user).subscribe();
  }

  ngOnDestroy() {
    this.projectsSubscription.unsubscribe();
  }

}
