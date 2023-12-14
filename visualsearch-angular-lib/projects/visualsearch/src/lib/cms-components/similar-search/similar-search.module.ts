import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { ImageSearchComponent } from './image-search/image-search.component';
import {CmsConfig, I18nModule, provideConfig, UrlModule} from "@spartacus/core";
import {RouterModule} from "@angular/router";
import {MediaModule, ProgressButtonModule, SpinnerModule} from "@spartacus/storefront";
import {ExtraSpartacusComponentsModule} from "../extra-spartacus-components/extra-spartacus-components.module";
import { ImageSearchResultsComponent } from './image-search-results/image-search-results.component';



@NgModule({
  declarations: [
    ImageSearchComponent,
    ImageSearchResultsComponent
  ],
    imports: [
        CommonModule,
        I18nModule,
        RouterModule.forChild([]),
        ProgressButtonModule,
        //to use product-grid-item component
        MediaModule,
        ExtraSpartacusComponentsModule,
        UrlModule,
        SpinnerModule,
    ],
  exports: [
    ImageSearchComponent
  ],
  providers:[
    provideConfig(<CmsConfig>{
      cmsComponents: {
        ImageSearchComponent: {
          component: ImageSearchComponent,
          childRoutes: [
            { path: '', redirectTo: 'image-search', pathMatch: 'full' },
            { path: 'image-search', component: ImageSearchComponent },
            { path: 'image-results', component: ImageSearchResultsComponent }
          ]
        }
      }
    })
  ],
})
export class SimilarSearchModule { }
