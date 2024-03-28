import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Image, ProductImage, Result} from "../../../models/visual-search.model";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import {VisualSearchService} from "../../../services/visual-search.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from "rxjs";
import {catchError, filter, map, take, tap} from "rxjs/operators";
import {Product} from "@spartacus/core";
import {ActiveCartFacade, OrderEntry} from "@spartacus/cart/base/root";
import {LaunchDialogService} from "@spartacus/storefront";
import {LAUNCH_DIALOGS} from "../../extra-spartacus-components/extra-spartacus-components.module";
import {DomSanitizer} from '@angular/platform-browser';
import * as _ from 'lodash';
import {
  ObjectDetectionCategory,
  VisualSearchImageAnalysisResponse,
  VisualSearchRecommendationSet,
  VisualSearchSimilarProducts
} from "../../../models/object-detection.model";
import {FileUploadService} from "../../../services/file-upload-service";

@Component({
  selector: 'lib-visual-search-results',
  templateUrl: './visual-search-results.component.html',
  styleUrls: ['./visual-search-results.component.scss']
})
export class VisualSearchResultsComponent implements OnInit{
  showMessage = false;
  searchResults: Result[];
  images:Image[] = [];
  productsFound$: Observable<Observable<Product>[]>;
  uploadedFileUrl:any;
  fileName:string;
  imageFormat = "cartItem";
  sessionImage$: Observable<Image>;
  selectedVariants: { [key: string]: Product } = { };
  selectedCategory$: Observable<ObjectDetectionCategory>;
  selectedSet$: Observable<VisualSearchRecommendationSet>;
  subscription: Subscription;
  busy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  error$: BehaviorSubject<any> = new BehaviorSubject(null);
  visualSearchSimilarProducts$: Observable<VisualSearchSimilarProducts>;
  visualSearchResults$: Observable<VisualSearchImageAnalysisResponse>;
  similarProductMode$: Observable<boolean>;
  backLink = '../upload';

  constructor(
    private sanitizer: DomSanitizer,
    private visualSearchService: VisualSearchService,
    private fileUploadService: FileUploadService,
    private dataService: VisualSearchDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private activeCartFacade: ActiveCartFacade,
    private launchDialogService: LaunchDialogService,
    private cd: ChangeDetectorRef,
    ) {
  }

  getProductsDetails() {
    this.productsFound$ = this.visualSearchService.getImageDetails(this.searchResults['products'])
      .pipe(
        map((response: Image[]) => {
          const productImages:ProductImage[] = response['products'];
          const uniqeProdIds:ProductImage[] = _.uniqBy(productImages, 'id');
          const products$ = uniqeProdIds.map(image => {
            image.url = this.sanitizer.bypassSecurityTrustUrl(image.url.toString());
            return this.visualSearchService.getProductDetails(image.id).pipe(
            filter(product => !!product)
          )});
          return products$;
        }),
      )
  }

  ngOnInit() {
    this.searchResults = this.dataService.getSearchResults();
    this.uploadedFileUrl = this.dataService.getUploadFileUrl();
    this.fileName = this.dataService.getFileName();
    this.selectedCategory$ = this.visualSearchService.getSelectedCategory();
    this.visualSearchResults$ = this.visualSearchService.getImageAnalysis();
    this.similarProductMode$ = of(true);
    this.sessionImage$ = this.fileUploadService.getCurrentSessionImage().pipe(
      tap(image => {
        if(image) {
          this.visualSearchService.getImageAnalysis().pipe(
            take(1)
          ).subscribe(imageAnalysis => {
            if(!imageAnalysis) {
              // this.startAnalyze();
            } else if(imageAnalysis.id && imageAnalysis.id !== image.altText) {
              //we have analysis for different image
              // this.visualSearchService.removeImageAnalysis();
              // this.startAnalyze();
            }
          })
        }
      }),

      catchError(error => {
        console.debug('[STYLEBUDDY_LOG_MARKER]', 'Error fetching image', error?.message);
        this.router.navigate([this.backLink], { relativeTo: this.activatedRoute });
        return of(null);
      })
    );

    this.subscription = combineLatest([this.selectedCategory$, this.similarProductMode$]).subscribe(
      ([category, similarProductMode]) => {
        if (category) {
          this.getRecommendations(category);
        }
      }
    );
    console.table(this.searchResults);


    if (!this.searchResults) {
      // this.router.navigate(['../welcome'], { relativeTo: this.activatedRoute })
    }
    /*if (this.searchResults['products'] && this.searchResults['products'].length > 0) {
      this.getProductsDetails();
    }*/
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getRecommendations(category: ObjectDetectionCategory) {
    this.busy$.next(true);
    this.error$.next(null)

    // this.visualSearchService.fetchSimilarProducts(category);
    this.fetchSimilarProducts(category);
  }


  fetchSimilarProducts(category: ObjectDetectionCategory) {

    this.visualSearchService.fetchSimilarProducts(category, true).subscribe(
      {
        next: (response: VisualSearchSimilarProducts) => {
          this.searchResults['products'] = _.uniqBy(response['products'], 'product_id');
          this.dataService.setSearchResults(this.searchResults);
          this.getProductsDetails();
          this.visualSearchSimilarProducts$ = of(response);
          this.busy$.next(false);
        },
        error: (error: any) => {
          this.error$.next(error);
          this.busy$.next(false);
      }}
    )
  }


  /*public addAllToCart(productCodes: string[]): void {
    const entries = productCodes.map((productCode) => {
      return {
        product: { code: productCode },
        quantity: 1,
      } as OrderEntry;
    });

    const cartEntries$ = entries.map((entry) => this.activeCartFacade.getEntry(entry.product.code));
    this.activeCartFacade.addEntries(entries);
    this.openModal(cartEntries$);
  }*/

  private openModal(cartEntries$: Observable<OrderEntry>[]) {
    const addToCartData = {
      entries$: cartEntries$,
    };

    const dialog = this.launchDialogService.openDialog(
      LAUNCH_DIALOGS.VS_ADDED_MANY_TO_CART,
      undefined,
      undefined,
      addToCartData
    );

    if (dialog) {
      dialog.pipe(take(1)).subscribe();
    }
  }

  public addToCart(productCode: string): void {
    const entry = {
        // product: { code: '553001' },
        product: { code: productCode },
        quantity: 1,
      } as OrderEntry;

    const cartEntries$ = this.activeCartFacade.getEntry(entry.product.code);
    this.activeCartFacade.addEntries([entry]);
    this.openModal([cartEntries$]);
  }

  public variantUpdated(baseProductCode: string, product: Product): void {
    this.selectedVariants[baseProductCode] = product;
  }
}
