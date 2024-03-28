import {Injectable} from "@angular/core";
import {OccConfig, OccEndpointsService, WindowRef} from "@spartacus/core";
import {STYLEBUDDY_LOG_MARKER, StyleBuddyConfigInternal} from "../config/stylebuddy.config";


@Injectable({
  providedIn: 'root'
})

export class VisualSearchEndpointsService {
  FALLBACK_API_VERSION = 'v3';
  apiVersion: string;
  mock = false;
  styleBuddyConfig: StyleBuddyConfigInternal;

  constructor(
    private occEndpointsService: OccEndpointsService,
    private occConfig: OccConfig,
    private winRef: WindowRef
  ) {
    this.mock = "1" === this.winRef.localStorage?.getItem('StyleBuddyEndpointsService.mock');
    if(this.mock) {
      console.warn('[visualsearch]', 'Using MOCK endpoints because StyleBuddyEndpointsService.mock is set in local storage');
    }
  }

  buildUrl(endpoint: string) {
    if (this.getForcedApiVersion()) {
      endpoint = endpoint.replace(
        '/api/',
        '/api/' + this.getForcedApiVersion() + '/'
      );
    }

    if(this.mock) {
      endpoint = endpoint.replace('/api/', '/mock/');
    }

    if (!this.styleBuddyConfig.backendUrl) {
      return this.occEndpointsService.buildUrl(endpoint);
    }

    return this.styleBuddyConfig.backendUrl + endpoint;
  }

  buildSseUrl(endpoint: string) {
    const occUrl = this.buildUrl(endpoint);
    return occUrl.replace('/occ/v2/', '/visualsearchwebservices/');
  }

  getMediaBaseUrl() {
    if (this.styleBuddyConfig.imageBaseUrl) {
      return this.styleBuddyConfig.imageBaseUrl;
    }

    return this.occConfig?.backend?.occ?.baseUrl;
  }

  getForcedApiVersion() {
    return this.winRef.localStorage?.getItem('StyleBuddyApiVersion');
  }

  getApiVersion(): string {
    //ability to force apiVersion
    const forcedApiVersion = this.getForcedApiVersion();
    if (forcedApiVersion) {
      console.warn(STYLEBUDDY_LOG_MARKER, 'Using forced apiVersion localStorage.StyleBuddyApiVersion', forcedApiVersion);
      this.apiVersion = forcedApiVersion;
    }

    if (!this.apiVersion) {
      this.apiVersion =
        this.styleBuddyConfig.apiVersion ||
        this.FALLBACK_API_VERSION;
    }

    return this.apiVersion;
  }
}
