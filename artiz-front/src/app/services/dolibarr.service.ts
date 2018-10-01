import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { map, mergeMap, catchError, exhaustMap, concatAll } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { throwError, of } from 'rxjs';

import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

import { Erp } from './erp.interface';
import { DoliRestService } from './dolibarr-rest.service';

import { environment } from '../../environments/environment';

import Project from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class DolibarrService implements Erp {

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private doliRestService: DoliRestService
  ) {  }

  /* ******************************
  /*  FromFront Actions
  /* ******************************/

  projectSyncFromFront(project: Project) {
    console.log('projectSyncFromFront', project);
    // création ou mise à jour du client
    return this.clientSync(project.client).pipe(
      // création ou mise à jour du projet
      mergeMap((clientId) => this.projectSync(clientId, project)),
      map((proposal: any) => {
        return {
          projectId: + proposal.id,
          clientId: + proposal.socid,
          productsId: proposal.lines.map((l) => + l.id),
        };
      }),
      catchError(this.handleError)
    );
  }

  projectBuildPdfFromFront(proposalId) {
   return this.projectGet(proposalId).pipe(
     mergeMap((proposal: any) => {
       let original_file;
       if (!proposal.last_main_doc) {
         original_file = '(PROV' + proposal.id + ')/(PROV' + proposal.id + ').pdf';
       } else {
         const docArray = proposal.last_main_doc.split('/');
         docArray.splice(0, 1);
         original_file = docArray.join('/');
       }
       const data = {
          'module_part': 'propal',
          'original_file': original_file,
          'doctemplate': 'azur',
          'langcode': 'fr_FR'
        };
        return this.doliRestService.documentBuilddocPdf(data);
     })
   );
  }

  projectGetPdfFromFront(proposalId) {
    return this.projectGet(proposalId).pipe(
      mergeMap((proposal: any) => {
        const docArray = proposal.last_main_doc.split('/');
        docArray.splice(0, 1);
        return this.doliRestService.documentDownloadPdf('propal', docArray.join('/'));
      })
    );
  }

  /* ******************************
  /*  Project Actions
  /* ******************************/

  private projectSync(clientId, project) {
    return this.projectGet(project.erpId).pipe(
      mergeMap((res: any) => {
        return this.projectUpdate(project.erpId, project);
      }),
      catchError((error: HttpErrorResponse) => {
        return this.projectCreate(clientId, project);
      })
    );
  }

  private projectGet(id: number) {
    return this.doliRestService.proposalsGet(id);
  }

  private projectCreate(clientId, project) {
    const date = Math.round(Date.now() / 1000);
    const duree_validite = 30;
    const data_create = {
      socid: clientId,
      statut: 0,
      ref_client: project.id,
      note_public: project.name,
      duree_validite: duree_validite,
      date: date,
      lines: this.projectMapLinesFromProducts(project.products)
    };
    return this.doliRestService.proposalsCreate(data_create).pipe(
      mergeMap((res: number) => {
        return this.doliRestService.proposalsGet(res);
      })
    );
  }

  private projectUpdate(id, project) {
    const products = project.products ? project.products : [];
    const data = {
      note_public: project.name,
    };
    return this.doliRestService.proposalsUpdate(id, data).pipe(
      // supprime les lignes présente dans l'ERP et absente de Artiz
      mergeMap((res: any) => {
        const linesToDelete = res.lines.filter((l) => {
          return (undefined === products.find((p) => p.erpId === + l.id));
        });
        if (!linesToDelete.length) {
          return of(null);
        }
        return forkJoin(linesToDelete.map((l) => {
          return this.doliRestService.proposalsLinesDelete(id, l.id);
        }));
      }),
      // Met à jour les lines existantes et ajoute les nouvelles
      mergeMap((res: any) => {
        return forkJoin(products.map((p, index) => {
          return this.projectProductSync(id, p, index);
        }));
      }),
      // Récupère la propale mise à jour
      mergeMap((res) => {
        return this.doliRestService.proposalsGet(id);
      })
    );
  }

  private projectProductSync(proposalId, product, index) {
    return this.projectProductUpdate(proposalId, product, index).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.projectProductCreate(proposalId, product, index);
      })
    );
  }

  private projectProductCreate(proposalId, product, index) {
    const data = this.projectMapLineFromProduct(product, index);
    return this.doliRestService.proposalsLinesCreate(proposalId, data);
  }

  private projectProductUpdate(proposalId, product, index) {
    const data = this.projectMapLineFromProduct(product, index);
    if (!product.erpId) {
      return this.doliRestService.proposalsLinesCreate(proposalId, data);
    }
    return this.doliRestService.proposalsLinesUpdate(proposalId, product.erpId, data);
  }

  private projectMapLinesFromProducts(products) {
    return products.map((p, index) => this.projectMapLineFromProduct(p, index));
  }

  private projectMapLineFromProduct(product, index) {
    return {
      desc: product.description,
      subprice: product.price,
      qty: product.qty,
      tva_tx: product.tva_tx,
      product_type: 0,
      rang: index
    };
  }

  /* ******************************
  /*  Client Actions
  /* ******************************/

  private clientGet(id: number) {
    return this.doliRestService.thirdpartiesGet(id);
  }

  private clientCreate(client) {
    console.log('clientCreate', client)
    const data = {
      name: (client.name && client.name.length) ? client.name : client.username,
      client: 1
    };
    console.log('clientCreate', data);
    return this.doliRestService.thirdpartiesCreate(data);
  }

  private clientUpdate(clientId, client) {
    const data = {
      name: (client.name && client.name.length) ? client.name : client.username,
    };
    return this.doliRestService.thirdpartiesUpdate(clientId, data);
  }

  private clientSync(client) {
    console.log('clientSync', client);
    return this.clientGet(client.erpId).pipe(
      mergeMap((res: any) => {
        return this.clientUpdate(res.id, client);
      }),
      map((res: any) => res.id),
      catchError((error: HttpErrorResponse) => {
        return this.clientCreate(client);
      })
    );
  }

  /* ******************************
  /*  ERRORS hnadler
  /* ******************************/

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
