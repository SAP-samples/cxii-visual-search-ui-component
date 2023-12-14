import { Injectable } from '@angular/core';
import { Product, ProductService, VariantOption } from '@spartacus/core';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VisualSearchProductService {
  public static readonly VS_PRODUCT_SCOPE = 'visualSearch';

  constructor(
    private productService: ProductService,
  ) {
  }

  get(code: string) {
    return this.productService.get(code, VisualSearchProductService.VS_PRODUCT_SCOPE);
  }

  getPurchasable(code: string) {
    return this.get(code).pipe(
      switchMap(product => {
        if(!product || product.purchasable !== false) {
          return of(product);
        }

        const purchasableCode = this.findPurchasableProductCode(product);
        if(!purchasableCode) {
          console.warn('[visualsearch]', 'Cannot find purchasable product for', product.code)
          return of(product);
        }

        return this.get(purchasableCode);
      })
    )
  }

  findPurchasableProductCode(product: Product): string | undefined {
    if (product.variantOptions?.length) {
      const results: VariantOption[] = product.variantOptions.filter(
        (variant) => {
          const outOfStock = variant.stock?.stockLevelStatus === 'outOfStock' || variant.stock?.stockLevel === 0;
          return !outOfStock;
        }
      );
      return results && results.length
        ? results[0]?.code
        : product.variantOptions[0]?.code;
    }
    return undefined;
  }
}
