import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  Product,
  BaseOption,
  VariantQualifier,
  VariantOptionQualifier,
  ProductScope,
} from '@spartacus/core';
import { filter, take } from 'rxjs/operators';
import { VisualSearchProductService } from '../../../../services/visual-search-product.service';

@Component({
  selector: 'app-variant-size-selector',
  templateUrl: './variant-size-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantSizeSelectorComponent {
  @Output() onProductChangeEmitter: EventEmitter<Product> = new EventEmitter();

  constructor(private productService: VisualSearchProductService) {}

  @Input()
  product: Product;

  @Input()
  variants: BaseOption;

  changeSize(code: string): void {
    if (code) {
      this.productService
        .get(code)
        .pipe(filter(Boolean), take(1))
        .subscribe((product: Product) => {
          this.onProductChangeEmitter.emit(product);
        });
    }
  }

  // filter sizes to match selected style
  isInSelectedStyle(qualifiers: VariantOptionQualifier[]) {
    const objStyle = qualifiers.find(
      (q) => q.qualifier === VariantQualifier.STYLE
    );
    const selectedObjStyle =
      this.variants.selected.variantOptionQualifiers.find(
        (q) => q.qualifier === VariantQualifier.STYLE
      ).value;
    if (selectedObjStyle == undefined) {
      // selected product doesn't have style
      return true;
    }
    return objStyle ? objStyle.value === selectedObjStyle : false;
  }

  getVariantOptionValue(qualifiers: VariantOptionQualifier[]) {
    const obj = qualifiers.find((q) => q.qualifier === VariantQualifier.SIZE);
    return obj ? obj.value : '';
  }
}
