import { NgModule } from '@angular/core';
import {AsyncPipe, CommonModule, NgForOf, NgIf} from '@angular/common';
import { VisualSearchComponent } from './visual-search/visual-search.component';
import {RouterModule} from "@angular/router";
import {CmsConfig, I18nModule, provideConfig, UrlModule} from "@spartacus/core";
import { VisualSearchWelcomeComponent } from './visual-search-welcome/visual-search-welcome.component';
import { VisualSearchUploadComponent } from './visual-search-upload/visual-search-upload.component';
import {VisualSearchResultsComponent} from "./visual-search-results/visual-search-results.component";
import {layoutConfig, MediaModule, ProgressButtonModule, SpinnerModule} from "@spartacus/storefront";
import { vsTranslations, vsTranslationsChunksConfig } from '../../../assets/translations/vs-translations'
import {ExtraSpartacusComponentsModule} from "../extra-spartacus-components/extra-spartacus-components.module";
import { SimilarSearchModule } from "../similar-search/similar-search.module";
import { ImageSearchComponent } from '../similar-search/image-search/image-search.component';
import { VisualSearchPreviewImageComponent } from './visual-search-preview-image/visual-search-preview-image.component';



@NgModule({
  declarations: [
    VisualSearchComponent,
    VisualSearchWelcomeComponent,
    VisualSearchUploadComponent,
    VisualSearchResultsComponent,
    VisualSearchPreviewImageComponent,
  ],
  imports: [
    CommonModule,
    I18nModule,
    RouterModule.forChild([]),
    ProgressButtonModule,
    SimilarSearchModule,
    //to use product-grid-item component
    MediaModule,
    ExtraSpartacusComponentsModule,
    UrlModule,
    SpinnerModule,
    AsyncPipe,
    NgForOf,
    NgIf,
    AsyncPipe,
    NgIf,
    AsyncPipe,
    NgIf,
    AsyncPipe,
  ],
  exports: [
    VisualSearchComponent,
    ImageSearchComponent
  ],
  providers:[
    provideConfig(layoutConfig),
    provideConfig({
      i18n: {
        resources: vsTranslations,
        chunks: vsTranslationsChunksConfig,
        fallbackLang: 'en',
      },
    }),
    provideConfig(<CmsConfig>{
      cmsComponents: {
        VisualSearchComponent: {
          component: VisualSearchComponent,
          childRoutes: [
            { path: '', redirectTo: 'welcome', pathMatch: 'full' },
            { path: 'welcome', component: VisualSearchWelcomeComponent },
            { path: 'upload', component: VisualSearchUploadComponent },
            { path: 'results', component: VisualSearchResultsComponent },
            { path: 'preview', component: VisualSearchPreviewImageComponent },
          ]
        }
      }
    })
  ]
})
export class StylebuddyVisualSearchModule { }
