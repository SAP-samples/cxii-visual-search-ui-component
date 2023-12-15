import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18nModule, UrlModule } from '@spartacus/core';
import { VariantStyleSelectorComponent } from './variant-style-selector.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CommonModule, RouterModule, UrlModule, I18nModule],
    declarations: [VariantStyleSelectorComponent],
    exports: [VariantStyleSelectorComponent]
})
export class VariantStyleSelectorModule {}
