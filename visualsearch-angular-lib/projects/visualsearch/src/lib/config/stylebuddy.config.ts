import { Injectable } from '@angular/core';
import { Config, OccEndpointsService } from '@spartacus/core';
import { Observable } from 'rxjs';

export const STYLEBUDDY_LOG_MARKER = '[stylebuddy]';
export const STYLEBUDDY_CONFIG_SCOPE = 'styleBuddy';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class StyleBuddyConfig {
  [STYLEBUDDY_CONFIG_SCOPE]?: StyleBuddyConfigInternal;
}

export interface StyleBuddyConfigInternal {
  //specify only if backend is hosted separate from occ baseUrl, e.g. https://my-instance/occ/v2/site-spa
  backendUrl?: string;
  //url to get uploaded image aka commerce mediaBaseUrl
  //for standard occ or empty backendUrl this will be automatically computed
  //if you use non-standard backendUrl you have to provide this link
  imageBaseUrl?: string;
  //maximum number of recommended sets, if more are returned only first x are shown
  maxSetSuggestions?: number;
  //maximum number of recommended products, if more are returned only first x are shown
  maxSimilarProductSuggestions?: number;
  //maximum allowed image size in bytes
  maxImageSize: number;
  //set to value >= 1000 to use polling instead of SSE, this is polling interval in ms
  imagePollingInterval?: number;
  //timeout for image links returned from stylebuddy api, after this time local cache will be invalidated if images are required
  imageLinksTimeoutSeconds: number;
  //by default data is saved to sessionStorage so state is kept after refreshing the page
  //set this to 0 to disable
  sessionStorageTimeoutSeconds: number;
  //external service used as img src (GET), string should contain {data} placeholder
  //if empty will try to use qrCodeDataUrlProvider callback
  qrCodeUrl?: string;
  //function that returns qrcode url for image src (can return data URL)
  qrCodeUrlProvider?: (
    data: string,
    config: StyleBuddyConfigInternal,
    occEndpointsService: OccEndpointsService
  ) => Observable<string>;
  //(only for testing) use mock products instead of products returned from the backend
  //categories are arbitrary strings, product codes should exist on the backend
  //products will be selected randomly from each category and products returned from stylebuddy backend will be ignored
  mockProducts?: { [category: string]: string[] };

  //defined on server-side
  allowStyleVariantSelection: boolean;
  objectDetectionMinScore: number;
  recommendationMinScore: number;
  similarProductMinScore: number;
  enableMockProducts?: boolean;
  apiVersion?: string;
}

declare module '@spartacus/core' {
  interface Config extends StyleBuddyConfig {}
}
