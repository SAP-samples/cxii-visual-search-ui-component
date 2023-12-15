import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseOption, VariantType, Product, VariantQualifier } from '@spartacus/core';

@Component({
  selector: 'app-external-product-variants-container',
  templateUrl: './external-product-variants-container.component.html',
})
export class ExternalProductVariantsContainerComponent implements OnInit {
  @Input() product: Product;
  @Input() showStyleVariants = true;
  @Input() showSizeVariants = true;

  @Output() updatedProductEmitter: EventEmitter<Product> =
    new EventEmitter<Product>();
  variants: BaseOption[] = [];
  variantType = VariantType;

  ngOnInit(): void {
    this.product.baseOptions.forEach((option: BaseOption) => {
      if (option?.variantType) {
        // since we have flat product variants structure we have to base on their attributes
        // and then properly filter variants in size/style components
        const variantOptions = option?.options[0];
        if (variantOptions.variantOptionQualifiers != undefined) {
          if (
            variantOptions.variantOptionQualifiers.some(
              (q) => q.qualifier === VariantQualifier.STYLE
            )
          ) {
            this.variants[VariantType.STYLE] = option;
          }
          if (
            variantOptions.variantOptionQualifiers.some(
              (q) => q.qualifier === VariantQualifier.SIZE
            )
          ) {
            this.variants[VariantType.SIZE] = option;
          }
        }
      }
    });

    /*if Admin enter a product into the collection that does not have a set default variant,
    this action will trigger behavior that will allow to select a
    default product based on the base product

    Example:
    To Collection we enter product with code `BR1023`
    -> then this action will trigger in parent component checking variantOptions
    -> we will get `BR1023BRO`
    -> then this action will trigger in parent component checking variantOptions
    -> `BR1023BRO10` (will get products till we will have variantOptions)
    */
    //commented because there is no support for above behavior here
    // if (this.product.hasOwnProperty('variantOptions')) {
    //   this.updatedProductEmitter.emit({ ...this.product });
    // }
  }

  public handleProductChange(event: Product): void {
    this.updatedProductEmitter.emit(event);
  }
}
