import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import { Result } from "../models/visual-search.model";
import { VisualSearchProductService } from './visual-search-product.service';
import { OccEndpointsService} from "@spartacus/core";
import * as _ from 'lodash';
import {switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class VisualSearchService {
  accessToken:string;
  tenantDetails: any;
  defaultCatalogId: string;
  catalogVersion: string;
  urls = {
    'productsUrl': '<tenant_url>/products?catalog_id=<catalogId>&catalog_version=<catalogVersion>',
    'searchUrl': '<tenant_url>/search?catalog_id=<catalogId>&catalog_version=<catalogVersion>&limit=20&app_id=visualSearch&component_id=gallery',
    'uploadUrl': '<tenant_url>/image/upload?catalog_id=<catalogId>&catalog_version=<catalogVersion>&app_id=visualSearch&component_id=gallery'
  }

  constructor(
    private http: HttpClient,
    private productService: VisualSearchProductService,
    private occEndpoints: OccEndpointsService
  ) { }

  public getTenantDetails(): Observable<Object> {
    const url = this.occEndpoints.buildUrl(`/cxai/config?fields=FULL`);
    console.log("Fetching tenant details from: ", url);
    return this.http
      .get(url, { responseType: 'json' });
  }

  public getDynamicToken(): Observable<string> {
    console.log("Fetching dynamic token");
    if (!this.tenantDetails) {
      return new Observable((observer) => {
        this.getTenantDetails().subscribe((data) => {
          this.tenantDetails = data;
          this.defaultCatalogId = this.tenantDetails['catalogId'];
          this.catalogVersion = this.tenantDetails['catalogVersion'];
          console.log("tenantDetails =", this.tenantDetails);
          const body = new HttpParams()
            .set("grant_type", 'client_credentials')
            .set("client_id", data['clientId'])
            .set("client_secret", data['clientSecret']);
          console.log("Fetching token from: ", data['authUrl']);
          this.http.post(data['authUrl'], body, {
          }).subscribe(
            (response) => {
              this.accessToken = response['access_token'];
              observer.next(this.accessToken);
              observer.complete();
            }
          )
        });
      })
    }
    return new Observable((observer) => {
      observer.next(this.accessToken);
      observer.complete();
    });
  }

  uploadImage(file: File): Observable<HttpEvent<any>> {
    const url = this.urls.uploadUrl.replace('<tenant_url>', this.tenantDetails['tenantUrl'])
                                          .replace('<catalogId>', this.defaultCatalogId)
                                          .replace('<catalogVersion>', this.catalogVersion);
    console.log("Upload URL: ", url);
    const formData: FormData = new FormData();

    formData.append('image', file, file.name);

    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    });


    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.request(req);
  }

  async doSearch(imageDetails, upload) {
    var data;
    if (upload) {
      data = {
          "attributes": [
            {
              "attribute_name": "image_id",
              "attribute_value": imageDetails.image_id
            }
          ]
        };
    } else {
      data = {
        "attributes": [
          {
            "attribute_name": "image_id",
            "attribute_value": imageDetails.image_id
          },{
            "attribute_name": "category",
            "attribute_value": imageDetails.category
          },{
            "attribute_name": "gender",
            "attribute_value": imageDetails.gender
          }
        ]
      };
    }
    const url = this.urls.searchUrl.replace('<tenant_url>', this.tenantDetails['tenantUrl'])
                                          .replace('<catalogId>', this.defaultCatalogId)
                                          .replace('<catalogVersion>', this.catalogVersion);
    console.log("Search URL: ", url);
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.accessToken
    });


    const req = new HttpRequest('POST', url, data, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.post(url, data, {
      headers: headers
    });
  }
  visualSearch(imageDetails: any, upload) {
    if (!this.accessToken) {
      const tokenPromise = this.getDynamicToken().toPromise();
      return tokenPromise.then((response) => {
        this.accessToken = response;
        return this.doSearch(imageDetails, upload);
      });
    } else {
      return this.doSearch(imageDetails, upload)
    }
  }

  async uploadSessionImage(file: File): Promise<Observable<any>> {
    const tokenPromise = this.getDynamicToken().toPromise();
    const uploadPromise = tokenPromise.then((response) => {
      this.accessToken = response;
      const uploadPromise = this.uploadImage(file).toPromise();
      return uploadPromise;
    });

    return uploadPromise.then((res) => {
      if (res.type === HttpEventType.UploadProgress) {
        //TODO: optionally handle large image upload progress
        // console.log(Math.round(100 * event.loaded / event.total));
        console.log('Uploading...');
      } else if (res instanceof HttpResponse) {
        // this.acceptImage()
        console.log("Uploaded... ", res)
        const test123 = this.visualSearch(res.body, true);
        console.log(test123);
        return test123;
      }
    });
  }


  getImageDetails(results: Result[]) {
    const url = this.urls.productsUrl.replace('<tenant_url>', this.tenantDetails['tenantUrl'])
                                          .replace('<catalogId>', this.defaultCatalogId)
                                          .replace('<catalogVersion>', this.catalogVersion);
    console.log("Products URL: ", url);
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    });
    const product_ids = results.map(result => {
      return result.product_id;
    });
    const data = {
      product_ids:_.uniq(product_ids)
    }

    return this.http.post(url, data, {
      headers: headers
    });
  }

  getProductDetails(product_id:string) {
    return this.productService.getPurchasable(product_id);
  }
}
