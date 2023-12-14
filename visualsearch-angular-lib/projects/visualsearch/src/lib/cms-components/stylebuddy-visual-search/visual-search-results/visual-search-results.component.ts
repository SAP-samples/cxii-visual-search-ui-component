import {Component, OnInit} from '@angular/core';
import {Image, ProductImage, Result} from "../../../models/visual-search.model";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import {VisualSearchService} from "../../../services/visual-search.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {filter, map, take} from "rxjs/operators";
import {Product} from "@spartacus/core";
import {ActiveCartFacade, OrderEntry} from "@spartacus/cart/base/root";
import {LaunchDialogService} from "@spartacus/storefront";
import {LAUNCH_DIALOGS} from "../../extra-spartacus-components/extra-spartacus-components.module";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as _ from 'lodash';

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
  selectedVariants: { [key: string]: Product } = { };

  constructor(
    private sanitizer: DomSanitizer,
    private visualSearchService: VisualSearchService,
    private dataService: VisualSearchDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private activeCartFacade: ActiveCartFacade,
    private launchDialogService: LaunchDialogService,
    ) {
  }

  /*doAsyncTask() {
    return new Promise((resolve, reject) => {
      this.visualSearchService
    });
  }*/
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
    console.table(this.searchResults);


    if (!this.searchResults) {
      this.router.navigate(['../welcome'], { relativeTo: this.activatedRoute })
    }
    if (this.searchResults['products'] && this.searchResults['products'].length > 0) {
      this.getProductsDetails();
    }
  }

  goBack(event: Event) {
    event.preventDefault();
    this.searchResults=[];
    this.router.navigate(['../welcome'], { relativeTo: this.activatedRoute })
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
