import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { map, catchError, exhaustMap, mergeMap, concatAll  } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { DolibarrService } from './dolibarr.service';

import { environment } from '../../environments/environment';

import ArtizServerResponse from '../models/artiz-server-response.model';
import User from '../models/user.model';
import Project from '../models/project.model';
import Product from '../models/product.model';

@Injectable()
export class ProjectService {

  apiUrl: string = environment.artixApi.url;

  project: Project = new Project();
  projectSubject = new Subject<Project>();
  projects: Project[] = [];
  projectsSubject = new Subject<Project[]>();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private erpService: DolibarrService
  ) { }

  emitProjectSubject(): void {
    this.projectSubject.next(this.project);
  }

  emitProjectsSubject(): void {
    this.projectsSubject.next(this.projects);
  }

  /* ******************************
  /*  CRUD Project
  /* ******************************/

  projectList(user: User) {
    if (user.role === 'admin') {
      return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/project/projects').pipe(
        map((res: ArtizServerResponse) => {
          if (res.success) {
            this.projects = res.data;
          } else {
            this.projects = [];
          }
          this.emitProjectsSubject();
          return res;
        }),
        catchError((err) => {
          return err;
        })
      );
    } else {
      return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/project/projects/' + user.role + '/' + user.id).pipe(
        map((res: ArtizServerResponse) => {
          if (res.success) {
            this.projects = res.data;
          } else {
            this.projects = [];
          }
          this.emitProjectsSubject();
          return res;
        }),
        catchError((err) => {
          return err;
        })
      );
    }
  }

  projectGet(id: number) {
    return this.httpClient.get<ArtizServerResponse>(this.apiUrl + '/project/project/' + id).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          this.project = res.data;
          if (!res.data.products) {
            this.project.products = [];
          }
        } else {
          this.project = new Project();
        }
        this.emitProjectSubject();
        return {success: res.success};
      }),
      catchError((err) => {
        return err;
      })
    );
  }

  projectCreate(project: any) {
    return this.httpClient.post<ArtizServerResponse>(this.apiUrl + '/project/project', project).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          this.project = res.data;
          this.emitProjectSubject();
        }
        return res;
      }),
      catchError((err) => {
        return err;
      })
    );
  }

  projectUpdate(project: any) {
    return this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/project/project/' + project.id, project).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          this.project = res.data;
          this.emitProjectSubject();
        }
        return res;
      }),
      catchError((err) => {
        return err;
      })
    );
  }

  projectDelete(projectId: number) {
    return this.httpClient.delete<ArtizServerResponse>(this.apiUrl + '/project/project/' + projectId).pipe(
      map((res: ArtizServerResponse) => {
        if (res.success) {
          this.project = new Project();
          this.emitProjectSubject();
        }
        return res;
      }),
      catchError((err) => {
        return err;
      })
    );
  }

  /* ******************************
  /*  CRUD Product
  /* ******************************/

  private productGenere(projectId: number) {
    return new Product().deserialize({
      id: null,
      projectId: projectId,
      qty: Math.round(Math.random() * 1000) / 100,
      price: Math.round(Math.random() * 1000) / 100,
      tva_tx: [5.5, 10, 20][Math.floor(Math.random() * 3)],
      description: 'Ceci est un produit.'
    });
  }

  productsCreate() {
    const products = [];
    let i = 0;
    while (i < 5) {
      products.push(this.productGenere(this.project.id));
      i++;
    }

    this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/project/products/' + this.project.id, products).subscribe(
      (res: ArtizServerResponse) => {
        this.project.products = res.data;
        this.emitProjectSubject();
      },
      (error) => {
        console.log('Something wrong');
      }
    );
  }

  productDelete(id: number) {
    this.httpClient.delete<ArtizServerResponse>(this.apiUrl + '/project/product/' + this.project.id + '/' + id).subscribe(
      (res: ArtizServerResponse) => {
        const index = this.project.products.findIndex(p => p.id === id);
        this.project.products.splice(index, 1);
        this.emitProjectSubject();
      },
      (error) => {
        console.log('Something wrong', error);
      }
    );
  }

  /* ******************************
  /*  Post Syncho ERP
  /* ******************************/

  private clientUpdateErpId(id): Observable<ArtizServerResponse> {
    return this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/project/erp/client/' + this.project.id, {
      artisan: this.project.artisan.id,
      client: this.project.client.id,
      erpId: id
    });
  }

  private projectUpdateErpId(id): Observable<ArtizServerResponse> {
    return this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/project/erp/project/' + this.project.id, {
      erpId: id
    });
  }

  private productUpdateErpId(id, erpId): Observable<ArtizServerResponse> {
    return this.httpClient.put<ArtizServerResponse>(this.apiUrl + '/project/erp/product/' + id, {
      erpId: erpId
    });
  }

  private productsUpdateErpId(productsId) {
    const productsUpdate = productsId.map((p, i) => {
      return this.productUpdateErpId(this.project.products[i].id, p);
    });
    return forkJoin(productsUpdate);
  }

  /* ******************************
  /*  Liaison ERP
  /* ******************************/

  erpSyncProject() {
    console.log('erpSyncProject', this.project);
    // synchronisation avec l'ERP
    return this.erpService.projectSyncFromFront(this.project).pipe(
      mergeMap((res: any) => {
        console.log('Mise à jour de artiz-server & création du PDF');
        return forkJoin([
          // mise à jour de la DBB artiz-server
          this.clientUpdateErpId(res.clientId),
          this.projectUpdateErpId(res.projectId),
          this.productsUpdateErpId(res.productsId),
          // creation du PDF (ou mise à jour)
          this.erpService.projectBuildPdfFromFront(res.projectId)
        ]);
      }),
      map((res) => {
        // mise à jour du projet local
        console.log('Mise à jour locale');
        this.project.client.erpId = res[0].data;
        this.project.client.isErpSync = true;
        this.project.isErpSync = true;
        this.project.erpId = res[1].data;
        res[2].map((r: any) => {
          const index = this.project.products.findIndex(p => p.id = r.data.id);
          this.project.products[index].erpId = r.data.erpId;
        });
        this.emitProjectSubject();
        return res[3];
      })
    );
  }

  erpGetPdf() {
    return this.erpService.projectGetPdfFromFront(this.project.erpId);
  }
}
