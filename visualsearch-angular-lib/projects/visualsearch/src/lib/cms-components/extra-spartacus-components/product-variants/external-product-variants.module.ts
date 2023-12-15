import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExternalProductVariantsContainerComponent } from './external-product-variants-container/external-product-variants-container.component';
import { VariantSizeSelectorModule } from './variant-size-selector/variant-size-selector.module';
import { VariantStyleSelectorModule } from './variant-style-selector/variant-style-selector.module';

@NgModule({
  declarations: [
    ExternalProductVariantsContainerComponent
  ],
  imports: [
    CommonModule,
    VariantSizeSelectorModule,
    VariantStyleSelectorModule,
  ],
  exports: [
    ExternalProductVariantsContainerComponent
  ],
})
export class ExternalProductVariantsModule {}
