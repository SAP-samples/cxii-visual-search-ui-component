import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  OccConfig,
  BaseOption,
  VariantQualifier,
  VariantOptionQualifier,
  Product,
  VariantOption,
  VariantType,
} from '@spartacus/core';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { VisualSearchProductService } from '../../../../services/visual-search-product.service';

@Component({
  selector: 'app-variant-style-selector',
  templateUrl: './variant-style-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantStyleSelectorComponent {
  @Output() onProductChangeEmitter: EventEmitter<Product> = new EventEmitter();
  private subscription: Subscription = new Subscription();
  constructor(
    private config: OccConfig,
    private productService: VisualSearchProductService
  ) {}

  filteredVariants: BaseOption = {
    variantType: VariantType.STYLE
  };

  variantQualifier = VariantQualifier;
  @Input()
  product: Product;

  @Input()
  variants: BaseOption;

  stylesFiltering() {
    let styles = new Set<string>();
    this.filteredVariants.options = this.variants.options.filter(
      (option: VariantOption) => {
        const styleOption = option.variantOptionQualifiers.find(
          (q) => q.qualifier === VariantQualifier.STYLE
        );
        if( !styles.has(styleOption.value) ){
          styles.add(styleOption.value)
          return true;
        }
        return false;
      }
    );
    this.filteredVariants.selected = this.variants.selected;
    return styles.size > 0 ? true : false;
  }

  getVariantOptionValue(qualifiers: VariantOptionQualifier[]) {
    const obj = qualifiers.find((q) => q.qualifier === VariantQualifier.STYLE);
    return obj ? obj.value : '';
  }

  getVariantThumbnailUrl(
    variantOptionQualifiers: VariantOptionQualifier[]
  ): string {
    const qualifier = variantOptionQualifiers.find((item) => item.image);
    return qualifier
      ? `${this.config.backend.occ.baseUrl}${qualifier.image.url}`
      : '';
  }

  changeStyle(variant: any): void {
    if (variant.code) {
      this.subscription.add(
        this.productService
          .get(variant.code)
          .pipe(filter(Boolean), take(1))
          .subscribe((product: Product) => {
            this.onProductChangeEmitter.emit(product);
          })
      );
    }
    return null;
  }
}
