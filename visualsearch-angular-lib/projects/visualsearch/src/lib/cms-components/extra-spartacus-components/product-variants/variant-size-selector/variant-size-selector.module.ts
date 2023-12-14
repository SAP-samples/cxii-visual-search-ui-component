import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18nModule, UrlModule } from '@spartacus/core';
import { VariantSizeSelectorComponent } from './variant-size-selector.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CommonModule, RouterModule, UrlModule, I18nModule],
    declarations: [VariantSizeSelectorComponent],
    exports: [VariantSizeSelectorComponent]
})
export class VariantSizeSelectorModule {}
