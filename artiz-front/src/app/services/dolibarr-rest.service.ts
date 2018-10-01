import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DoliRestService {

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {  }

  /* ******************************
  /*  REST thirdparties
  /* ******************************/

  thirdpartiesGet(id: number) {
    console.log('thirdpartiesGet', id, this.authService.getDoliUrl() + '/thirdparties/' + id)
    return this.httpClient.get(this.authService.getDoliUrl() + '/thirdparties/' + id);
  }

  thirdpartiesCreate(data) {
    data.notrigger = 1;
    return this.httpClient.post(this.authService.getDoliUrl() + '/thirdparties', data);
  }

  thirdpartiesUpdate(id: number, data) {
      data.notrigger = 1;
    return this.httpClient.put(this.authService.getDoliUrl() + '/thirdparties/' + id, data);
  }

  /* ******************************
  /*  REST proposals
  /* ******************************/

  proposalsGet(id: number) {
    return this.httpClient.get(this.authService.getDoliUrl() + '/proposals/' + id);
  }

  proposalsCreate(data) {
      data.notrigger = 1;
    return this.httpClient.post(this.authService.getDoliUrl() + '/proposals', data);
  }

  proposalsUpdate(id: number, data) {
    data.notrigger = 1;
    return this.httpClient.put(this.authService.getDoliUrl() + '/proposals/' + id, data);
  }

  proposalsLinesGet(id: number, lineId: number) {
    return this.httpClient.get(this.authService.getDoliUrl() + '/proposals/' + id + '/lines/' + lineId);
  }

  proposalsLinesCreate(id: number, data) {
    data.notrigger = 1;
    return this.httpClient.post(this.authService.getDoliUrl() + '/proposals/' + id + '/lines', data);
  }

  proposalsLinesUpdate(id: number, lineId: number, data) {
    data.notrigger = 1;
    return this.httpClient.put(this.authService.getDoliUrl() + '/proposals/' + id + '/lines/' + lineId, data);
  }

  proposalsLinesDelete(id: number, lineId: number) {
    return this.httpClient.delete(this.authService.getDoliUrl() + '/proposals/' + id + '/lines/' + lineId);
  }

  /* ******************************
  /*  REST documents
  /* ******************************/

  documentDownloadPdf(module_part: string, original_file: string) {
    const params = new HttpParams()
      .set('module_part', module_part)
      .set('original_file', original_file);
    return this.httpClient.get(this.authService.getDoliUrl() + '/documents/download', {params});
  }

  documentBuilddocPdf(data) {
    return this.httpClient.put(this.authService.getDoliUrl() + '/documents/builddoc', data);
  }

}
