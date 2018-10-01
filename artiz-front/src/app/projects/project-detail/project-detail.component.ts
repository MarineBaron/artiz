import { Component, SecurityContext, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';


import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { AlertsService } from 'angular-alert-module';

import Project from '../../models/project.model';
import User from '../../models/user.model';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

  title = 'Détail d\'un projet';
  project: Project = new Project();
  projectSubscription: Subscription;
  user: User = new User();
  isAuthEdit = false;
  isAuthSync = false;
  isErpAllSync = false;
  status = 'loading';
  fileDownloaded = false;
  fileHref = '';
  fileDownload = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private alerts: AlertsService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.projectSubscription = this.projectService.projectSubject.subscribe(
      (project) => {
        this.project = project;
        this.status = 'ok';
      }
    );
    this.user = this.authService.user;
    this.getProject();
  }

  getProject() {
    const id = this.route.snapshot.paramMap.get('id');
    this.projectService.projectGet(+ id).subscribe(
      (result) => {
        this.setIsAuthEdit();
        this.setIsErpAllSync();
        this.setIsAuthSync();
        this.status = 'ok';
      },
      (error) => {
        this.setIsAuthEdit();
        this.setIsErpAllSync();
        this.setIsAuthSync();
        this.status = 'error';
      }
    );
  }

  setIsAuthEdit() {
    this.isAuthEdit = this.user.role === 'admin'
      || this.project.artisan.id === this.user.id;
  }

  setIsAuthSync() {
    const erpApikey = this.authService.getErpapikey();
    this.isAuthSync = !this.isErpAllSync && erpApikey && erpApikey.length
      && this.project.artisan.id === this.user.id ;
  }

  setIsErpAllSync() {
    this.isErpAllSync = this.project.isErpSync && this.project.client.isErpSync;
  }

  onDelete() {
    this.status = 'loading';
    const id = this.route.snapshot.paramMap.get('id');
    this.projectService.projectDelete(+ id).subscribe(
      (result) => {
        this.router.navigate(['projects']);
      }
    );
  }

  onSyncErp() {
    this.fileDownloaded = false;
    this.status = 'loading';
    this.projectService.erpSyncProject().subscribe(
      (result: any) => {
        this.alerts.setMessage('La synchronisation avec l\'ERP est effectuée.', 'success');
        this.status = 'ok';
        this.fileDownloaded = true;
        this.fileHref = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + result.content) as string;
        this.fileDownload = result.filename;
        this.setIsAuthSync();
        this.setIsErpAllSync();
      },
      (error) => {
        this.alerts.setMessage('Une erreur est survenue lors de la synchronisation avec l\'ERP.', 'error');
        this.status = 'error';
        console.log(error);
      }
    );
  }

  onGetPdf() {
    this.fileDownloaded = false;
    this.status = 'loading';
    this.projectService.erpGetPdf().subscribe(
      (result: any) => {
        this.fileDownloaded = true;
        this.status = 'ok';
        this.fileHref = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;base64,' + result.content) as string;
        this.fileDownload = result.filename;
      },
      (error) => {
        this.status = 'error';
      }
    );
  }

  onStopError() {
    this.status = 'ok';
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }

}
