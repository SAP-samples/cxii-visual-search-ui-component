import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {distinctUntilChanged, filter, finalize, map, switchMap, take, tap} from 'rxjs/operators';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import {Result} from "../models/visual-search.model";
import {VisualSearchProductService} from './visual-search-product.service';
import {Image, OccConfig, OccEndpointsService, WindowRef} from "@spartacus/core";
import * as _ from 'lodash';
import {VisualSearchDataService} from "./visual-search-data.service";
import {
  ObjectDetectionCategory,
  VisualSearchImageAnalysisResponse,
  VisualSearchRecommendation,
  VisualSearchRecommendationProduct,
  VisualSearchRecommendationSet,
  VisualSearchSimilarProducts
} from "../models/object-detection.model";
import {ImageAnalysisResponseNormalizer} from "./normalizer/ImageAnalysisResponseNormalizer";
import {VisualSearchSimilarProductsNormalizer} from "./normalizer/visual-search-similar-products-normalizer";
import {FileUploadService} from "./file-upload-service";
import {debug} from "ng-packagr/lib/utils/log";

@Injectable({
  providedIn: 'root'
})
export class VisualSearchService {
  accessToken: string;
  tenantDetails: any;
  defaultCatalogId: string;
  catalogVersion: string;
  urls = {
    'productsUrl': '<tenant_url>/products?catalog_id=<catalogId>&catalog_version=<catalogVersion>',
    'searchUrlOld': '<tenant_url>/search?catalog_id=<catalogId>&catalog_version=<catalogVersion>&limit=20&app_id=visualSearch&component_id=<component_id>',
    'searchUrl': '<tenant_url>/search?catalog_id=<catalogId>&catalog_version=<catalogVersion>&limit=20',
    'uploadUrl': '<tenant_url>/image/upload?catalog_id=<catalogId>&catalog_version=<catalogVersion>&app_id=visualSearch&component_id=gallery'
  }
  private _state: VisualSearchState;
  private imageChangeNotification$ = new BehaviorSubject<Image>(null);
  private imageUploading$ = new BehaviorSubject<boolean>(false);
  private uploadedImage: Image;

  constructor(
    private http: HttpClient,
    private productService: VisualSearchProductService,
    private occEndpoints: OccEndpointsService,
    private dataService: VisualSearchDataService,
    private converter: ImageAnalysisResponseNormalizer,
    private similarProductsConverter: VisualSearchSimilarProductsNormalizer,
    private winRef: WindowRef,
    private occConfig: OccConfig,
  ) {
    this.loadState();
  }

  public getTenantDetails(): Observable<Object> {
    const url = this.occEndpoints.buildUrl(`/cxai/config?fields=FULL`);
    console.log("Fetching tenant details from: ", url);
    return this.http
      .get(url, {responseType: 'json'});
  }

  loadState() {
    const stateJson = this.winRef.sessionStorage?.getItem(
      'StyleBuddyState'
    );
    if (stateJson) {
      try {
        this._state = JSON.parse(stateJson);
        console.debug('[stylebuddy]', 'state loaded from sessionStorage', this._state);

        if (this._state?.expires &&
          this._state.expires < new Date().getTime()) {
          console.debug('[stylebuddy]', 'state expired');
          this.winRef.sessionStorage?.removeItem('[stylebuddy]');
          this._state = emptyStyleBuddyState;
        }
      } catch (error) {
        console.error('[stylebuddy]', 'Error restoring state from storage', 'StyleBuddyState', error);
        this.winRef.sessionStorage?.removeItem('StyleBuddyState');
        this._state = emptyStyleBuddyState;
      }
    } else {
      //no sessionStorage state found
      this._state = emptyStyleBuddyState;
    }

    this.imageAnalysis$.next(this._state.imageAnalysis);
    this.selectedCategory$.next(this._state.selectedCategory);
    this.selectedSet$.next(this._state.selectedSet);
    this.similarProductMode$.next(
      this.getComputedSimilarProductMode(this._state.similarProductMode)
    );
    this.selectedProducts$.next(this._state.selectedProducts);
    this.selectedVariants$.next(this._state.selectedVariants);
  }

  private selectedProducts$ = new BehaviorSubject(
    emptyStyleBuddyState.selectedProducts
  );

  private selectedVariants$ = new BehaviorSubject(
    emptyStyleBuddyState.selectedVariants
  );

  private imageAnalysis$ = new BehaviorSubject(
    emptyStyleBuddyState.imageAnalysis
  );

  private similarProductMode$ = new BehaviorSubject(
    this.getComputedSimilarProductMode(emptyStyleBuddyState.similarProductMode)
  );

  private selectedCategory$ = new BehaviorSubject(
    emptyStyleBuddyState.selectedCategory
  );

  private selectedSet$ = new BehaviorSubject(emptyStyleBuddyState.selectedSet);

  protected getComputedSimilarProductMode(
    similarProductMode?: boolean,
    defaultValue = true
  ): boolean {
    //assume VS is default because style buddy recommendations are not good
    return similarProductMode == null ? defaultValue : similarProductMode;
  }

  getSelectedCategory(): Observable<ObjectDetectionCategory> {
    return this.selectedCategory$.asObservable().pipe(distinctUntilChanged());
  }

  fetchImageAnalysis(
    needImages: boolean
  ): Observable<VisualSearchImageAnalysisResponse> {
    const sessionData = needImages
      ? this.getAnalysisFromSession()
      : this.state.imageAnalysis;
    if (sessionData) {
      return of(sessionData);
    }

    return this.analyzeImage()
      .pipe(
        tap((response: VisualSearchImageAnalysisResponse) => this.storeAnalysisInSession(response)),
        tap((_) =>
          this.updateState({
            recommendations: {},
            similarProducts: {},
            privateSet: emptyStyleBuddyState.privateSet,
          })
        )
      );
  }

  protected storeAnalysisInSession(data: VisualSearchImageAnalysisResponse) {
    if (data) {
      data.expires = 1000;
      /*if (this.styleBuddyConfig.imageLinksTimeoutSeconds >= 0) {
        const now = new Date().getTime();
        //aws links expiry time
        data.expires =
          now + this.styleBuddyConfig.imageLinksTimeoutSeconds * 1000;
      }*/
      this.updateState({imageAnalysis: data});
    } else {
      this.removeImageAnalysis();
    }
  }

  analyzeImage(): Observable<VisualSearchImageAnalysisResponse> {
    return this.objectDetection().pipe(
      map((response, apiConverterSet) => {
        return this.converter.convert(response);
      })
    );
  }

  /*protected getConverterSetForApiVersion(): Observable<VisualSearchConverterSet> {
    return of(
      this.normalizerMap[this.styleBuddyEndpointsService.getApiVersion()]
    );
  }*/

  protected getAnalysisFromSession(): VisualSearchImageAnalysisResponse {
    const response = this.state.imageAnalysis;
    if (response) {
      return null;
    }

    const now = new Date().getTime();
    if (response?.expires && response.expires < now) {
      console.debug('[stylebuddy]', 'imageAnylysis expired');
      this.removeImageAnalysis();
      return null;
    }

    return response;
  }

  /**
   * Remove cached object detection result
   */
  public removeImageAnalysis() {
    this.updateState({imageAnalysis: null});
  }

  updateState(stateDiff: Partial<VisualSearchState>) {
    let anyChange = false;

    const newState = {...this._state, ...stateDiff};
    const changes: { [K in keyof VisualSearchState]?: boolean } = {};

    for (const change in stateDiff) {
      if (this.state[change] ^ newState[change]) {
        changes[change] = true;
        anyChange = true;
      } else {
        changes[change] =
          JSON.stringify(newState[change]) !=
          JSON.stringify(this._state[change]);
        anyChange = anyChange || changes[change];
      }
    }

    if (!anyChange) {
      console.debug(
        '[stylebuddy]',
        'Update state with: ',
        stateDiff,
        ' no changes'
      );
      return;
    }

    console.debug(
      '[stylebuddy]',
      'Update state with:',
      stateDiff,
      'changes',
      changes,
      'newState',
      newState
    );

    this._state = newState;
    if (changes.selectedCategory) {
      this.selectedCategory$.next(newState.selectedCategory);
    }
    if (changes.selectedSet) {
      this.selectedSet$.next(newState.selectedSet);
    }
    if (changes.selectedProducts) {
      this.selectedProducts$.next(newState.selectedProducts);
    }
    if (changes.selectedVariants) {
      this.selectedVariants$.next(newState.selectedVariants);
    }
    if (changes.imageAnalysis) {
      this.imageAnalysis$.next(newState.imageAnalysis);
    }
    if (changes.similarProductMode) {
      this.similarProductMode$.next(
        this.getComputedSimilarProductMode(newState.similarProductMode)
      );
    }
  }

  protected get state(): VisualSearchState {
    return Object.freeze(this._state);
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
          this.http.post(data['authUrl'], body, {}).subscribe(
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
    return of(req).pipe(
      tap(() => this.imageUploading$.next(true)),
      switchMap((request) => this.http.request(request)),
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.imageChangeNotification$.next(event.body);
        }
      }),
      finalize(() => {
        this.imageUploading$.next(false);
      })
    )

    // return this.http.request(req);
  }

  public getImageUploadingFlag() {
    return this.imageUploading$;
  }

  doSearch(imageDetails, upload): Observable<any> {
    const file = this.dataService.getFile()
    var data;
    const formdata = new FormData();
    if (upload) {
      const imageUrl = this.getMediaBaseUrl() + this.getPreviewImageData().url;
      if (this.dataService.isOjectDetectionEnabled) {
        data = {
          "attributes": [
            {
              "attribute_name": "image_url",
              "attribute_value": imageUrl
            },
            {
              "attribute_name": "input_text",
              "attribute_value": imageDetails.code
            },
            {
              "attribute_name": "bbox",
              "attribute_value": {
                "bottom_row": imageDetails.bboxBottom,
                "left_col": imageDetails.bboxLeft,
                "right_col": imageDetails.bboxRight,
                "top_row": imageDetails.bboxTop
              }
            }
          ]
        };
        formdata.append("image_payload", JSON.stringify(data));
      } else {
        formdata.append("image", file, file.name);
      }
    }

    const component_id = this.dataService.isOjectDetectionEnabled ? 'segmentedimages' : 'gallery';
    const url = this.urls.searchUrl.replace('<tenant_url>', this.tenantDetails['tenantUrl'])
      .replace('<catalogId>', this.defaultCatalogId)
      .replace('<catalogVersion>', this.catalogVersion);
      // .replace('<component_id>', component_id);

    console.log("Search URL: ", url);
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.accessToken
    });


    const req = new HttpRequest('POST', url, formdata, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.post(url, formdata, {
      headers: headers,
    });
  }

  fetchSimilarProducts(imageDetails: any, upload) {
    if (!this.accessToken) {
      const tokenPromise = this.getDynamicToken().pipe(
        map((response) => {
            this.accessToken = response;
            return this.doSearch(imageDetails, upload);
          }
        ))
    } else {
      return this.doSearch(imageDetails, upload);
    }
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

  getImageAnalysis(): Observable<VisualSearchImageAnalysisResponse> {
    return this.imageAnalysis$.asObservable();
  }

  objectDetection(): Observable<Object> {
    const file = this.dataService.getFile();
    const formData: FormData = new FormData();
    const uploadedUrl = this.getMediaBaseUrl() + this.getPreviewImageData().url;

    formData.append('image_url', uploadedUrl);
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    });

    const url = this.tenantDetails['tenantUrl'].replace("vision", "objectdetection").concat("/detector");
    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json',
      headers: headers
    });

    return this.http.post(url, formData, {
      headers: headers,
      reportProgress: true,
      responseType: 'json'
    })
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

        // return this.objectDetection();
        // const test123 = this.visualSearch(res.body, true);
        // console.log(test123);
        return of(true);
      }
    });
  }


  getImageDetails(results: Result[]) {
    const url = this.urls.productsUrl.replace('<tenant_url>', this.tenantDetails['tenantUrl'])
      .replace('<catalogId>', this.defaultCatalogId)
      .replace('<catalogVersion>', this.catalogVersion)
      .replace("v2", "v1");
    console.log("Products URL: ", url);
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    });
    const product_ids = results.map(result => {
      return result.product_id;
    });
    const data = {
      product_ids: _.uniq(product_ids)
    }

    return this.http.post(url, data, {
      headers: headers
    });
  }

  getProductDetails(product_id: string) {
    return this.productService.getPurchasable(product_id);
  }

  selectCategory(category: ObjectDetectionCategory) {
    if (this.state.selectedCategory?.uid === category?.uid) {
      return;
    }

    this.updateState({selectedCategory: category});
  }

  protected selectPurchasableVariants(
    products: VisualSearchRecommendationProduct[]
  ) {
    for (const product of products || []) {
      if (!this.state.selectedVariants[product.code]) {
        this.productService
          .getPurchasable(product.code)
          .pipe(
            filter((p) => !!p),
            take(1)
          )
          .subscribe((purchasableProduct) => {
            if (purchasableProduct.code != product.code) {
              this.selectVariantCode(product.code, purchasableProduct.code);
            }
          });
      }
    }
  }

  protected selectVariantCode(
    productCode: string,
    selectedVariantCode: string
  ) {
    this.updateState({
      selectedVariants: {
        ...this.state.selectedVariants,
        [productCode]: selectedVariantCode,
      },
    });
  }

  getMediaBaseUrl() {
    return this.occConfig?.backend?.occ?.baseUrl;
  }

  setPreviewImageData(image: Image) {
    this.uploadedImage = image;
  }

  getPreviewImageData() {
    return this.uploadedImage;
  }

  getMaxFileSize() {
    return 2 * 1024 * 1024;
  }

  public formatFileSize(size: number) {
    return (size / (1024 * 1024.0)).toFixed(2) + ' MB';
  }

  public getMaxFileSizeHumanReadable() {
    return this.formatFileSize(this.getMaxFileSize());
  }
}

interface VisualSearchState {
  selectedProducts: { [key: string]: boolean };
  selectedVariants: { [key: string]: string };
  selectedSet: VisualSearchRecommendationSet;
  //private set that stores similar products selected by user
  privateSet: VisualSearchRecommendationSet;
  selectedCategory: ObjectDetectionCategory;
  recommendations: { [key: string]: VisualSearchRecommendation };
  similarProducts: { [key: string]: VisualSearchSimilarProducts };
  imageAnalysis: VisualSearchImageAnalysisResponse;
  expires?: number;
  similarProductMode?: boolean;
}

const emptyStyleBuddyState: VisualSearchState = {
  selectedProducts: {},
  selectedVariants: {},
  selectedCategory: null,
  privateSet: {
    id: 'private-set',
    name: undefined,
    products: [],
    score: 1,
  },
  selectedSet: null,
  recommendations: {},
  similarProducts: {},
  imageAnalysis: null,
};
