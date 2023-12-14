# VisualSearchAngularLib

# Add to project
## Backend
1. Add `https://github.tools.sap/CXAI/visual-search` as a submodule to commerce sources
1. Add `https://github.tools.sap/cx-solexp-modules/stylebuddy` as a submodule to commerce sources
2. Add `cxaibackoffice`, `cxaiocc` to recipe and / or ccv2 manifest
  * For ccv2 manifest also add the following to `api` aspect (currently it contains SSE endpoint because of problem enabling it in occ)
   ```json
        {
          "name": "stylebuddyservices",
          "contextPath": "/stylebuddywebservices"
        },
    ``` 


3. Set stylebuddy properties
```properties
stylebuddy.authUrl=https://cxaimldev.authentication.us21.hana.ondemand.com/oauth/token
stylebuddy.tenantUrl=https://use-canary.cxai.dev.sap/inference/api/v1/stylingassistant
stylebuddy.clientId=
stylebuddy.clientSecret=
```
4. Create a sample page with style buddy component
```csv
$contentCatalog = fashion-spaContentCatalog
$version = Staged
$contentCV = catalogVersion(CatalogVersion.catalog(Catalog.id[default=$contentCatalog]), CatalogVersion.version[default=$version])[default=$contentCatalog:$version]
$lang = en

INSERT_UPDATE CMSFlexComponent; $contentCV[unique = true]; uid[unique = true]           ; name                         ; flexType
                              ;                          ; StyleBuddyImageFlowComponent ; StyleBuddyImageFlowComponent ; StyleBuddyImageFlowComponent

INSERT_UPDATE ContentSlot; $contentCV[unique = true]; uid[unique = true]       ; name                           ; active; cmsComponents(uid, $contentCV)
                         ;                          ; Section2ASlot-styleBuddy ; Section2A Slot for Style Buddy ; true  ; StyleBuddyImageFlowComponent

INSERT_UPDATE ContentSlotForPage; $contentCV[unique = true]; uid[unique = true]    ; position[unique = true]; page(uid, $contentCV)[unique = true]; contentSlot(uid, $contentCV)[unique = true]
                                ;                          ; Section2A-styleBuddy  ; Section2A              ; styleBuddyPage                      ; Section2ASlot-styleBuddy

INSERT_UPDATE ContentPage; $contentCV[unique = true]; uid[unique = true] ; name             ; masterTemplate(uid, $contentCV); label          ; defaultPage[default = 'true']; approvalStatus(code)[default = 'approved']; homepage[default = 'false']; title[lang = $lang]
                         ;                          ; styleBuddyPage     ; Style Buddy Page ; ContentPage1Template           ; /styling-buddy ;                              ;                                           ;                            ; "Styling Buddy"



```

## Frontend
1. Add `@cx-spartacus/stylebuddy` dependency to your app's `package.json`
  * if you don't have npm repository you can use tgz files from [s3 url] or you can build the library tgz yourself as described in [Development](#Development)
2. Import `StylebuddyModule` to `app.module`
```ts
    StylebuddyModule.forRoot({
      qrCodeUrl: "https://api.cu2qdtboy0-public1-p13-public.model-t.cc.commerce.ondemand.com/occ/v2/fashion-spa/qrcode?data={data}",
    }
```

### Configuration
You can pass custom configuration to `StylebuddyModule.forRoot({ ... })`. Only `qrCodeUrl` or `qrCodeUrlProvider` is required (the library doesn't include bundled qrcode solution)
```ts
export interface StyleBuddyConfig {
  //specify only if backend is hosted separate from occ baseUrl, e.g. https://my-instance/occ/v2/site-spa
  backendUrl?: string;
  //url to get uploaded image aka commerce mediaBaseUrl
  //for standard occ or empty backendUrl this will be automatically computed
  //if you use non-standard backendUrl you have to provide this link
  imageBaseUrl?: string;
  //maximum number of recommended sets, if more sets are returned only first x are shown
  maxSetSuggestions?: number;
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
  qrCodeUrlProvider?: (data: string, config: StyleBuddyConfig, occEndpointsService: OccEndpointsService) => Observable<string>
  //(only for testing) use mock products instead of products returned from the backend
  //categories are arbitrary strings, product codes should exist on the backend
  //products will be selected randomly from each category and products returned from stylebuddy backend will be ignored
  mockProducts?: {[category:string]: string[]}
}
```
Default values
```ts
export const defaultStyleBuddyConfig: StyleBuddyConfig = {
  maxImageSize: 10485760,
  maxSetSuggestions: 4,
  imageLinksTimeoutSeconds: 299,
  //never expire
  sessionStorageTimeoutSeconds: -1,
}
```

### Product endpoint configuration
By default lib uses endpoind from stylebuddocc and caches for 120s. You can modify this by providing your own config. Custom endpoint is used to avoid problems with missing classification in some apparell products (default product endpoint populates classification scope, custom endpoint dont). See https://sap.github.io/spartacus-docs/loading-scopes/ for reference.
```ts
    provideConfig(<OccConfig>{
      backend: {
        occ: {
          endpoints: {
            product: {
              [StyleBuddyProductService.STYLEBUDDY_PRODUCT_SCOPE]:
                'style-buddy/products/${productCode}?fields=code,name,stock(FULL),purchasable,averageRating,images(FULL),manufacturer,numberOfReviews,categories(DEFAULT),baseOptions,baseProduct,variantOptions(FULL),variantType',
            }
          }
        },
        loadingScopes: {
          product: {
            [StyleBuddyProductService.STYLEBUDDY_PRODUCT_SCOPE]: {
              maxAge: 120
            }
          },
        },
      }
    }),
```
### Example of qrcode handlers
1. From static GET URL
```js
qrCodeUrl = "https://my-qr-service/qrcode?data={data}"
```
2. From local js library (here example for `qrcode` library)
```js
      qrCodeUrlProvider: (data, config, occEndpointsService) => {
        const QRCode = require('qrcode')
        const options = {
          color: {
            dark: '#ff0000',
            light: '#ffffff',
          },
        };
        return QRCode.toDataURL(data, options);
      }
```
### Example connecting to another instance
```ts
    StylebuddyModule.forRoot({
      backendUrl: 'https://rum-test-instance.demo.hybris.com/occ/v2/fashion-spa',
      qrCodeUrl: 'https://rum-test-instance.demo.hybris.com/occ/v2/fashion-spa/qrcode?data={data}&c1=000000&c2=ffcccc',
      //it's needed because other instance returns foreign product codes
      mockProducts: {
        digitalCompacts: [ '1981415', '1934795', '1992693'],
        filmCameras: ['779841',  '898503'],
        camcorders: [ '1986316', '1432722', '1776948'],
        webcams: [ '280916', '479742' ],
        accesories: ['2063624', '2231913', '266685' ],
        slr: ['1391319', '1446509'],
      },
    }),
```
### Example providing custom StyleBuddyApiService
You can provide custom StyleBuddyApiService implementation (e.g. mock implementation, or implementation that calls style buddy API directly instead of using OCC). Default implementation uses stylebudocc backend extension.

in `app.module.ts` of you application provide your own implementation
```ts
    { provide: StyleBuddyApiService, useClass: MyStyleBuddyOccApiService }, 
```

See `StyleBuddyOccApiService` for implementation example. There are default converters available that convert stylebuddy response format to internal model classes.

# Development
To develop this library with your own sample spartacus aplication as a hosting app:

1. Add library definition to `angular.json` projects section. <b>Change paths to location of library sources on your disk</b>
```json    
    "@cx-spartacus/stylebuddy": {
      "projectType": "library",
      "root": "../../core-customize/stylebuddy/stylebuddy-angular-lib/projects/stylebuddy",
      "sourceRoot": "projects/stylebuddy/src",
      "prefix": "lib",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:ng-packagr",
          "options": {
            "project": "../../core-customize/stylebuddy/stylebuddy-angular-lib/projects/stylebuddy/ng-package.json"
          },
          "configurations": {
            "production": {
              "tsConfig": "../../core-customize/stylebuddy/stylebuddy-angular-lib/projects/stylebuddy/tsconfig.lib.prod.json"
            },
            "development": {
              "tsConfig": "../../core-customize/stylebuddy/stylebuddy-angular-lib/projects/stylebuddy/tsconfig.lib.json"
            }
          },
          "defaultConfiguration": "production"
        }
      }
```
1. Add paths to `tsconfig.json` of your app. You have to declare both `@cx-spartacus/stylebuddy` as well as all `peerDependecies` from this library like in following example:
```json
    "paths": {
      "@cx-spartacus/stylebuddy": ["../../core-customize/stylebuddy/stylebuddy-angular-lib/dist/stylebuddy"],
      "@angular/*": ["./node_modules/@angular/*"],
      "@spartacus/*": ["./node_modules/@spartacus/*"],
    }
```
1. `npm i` in projects/stylebuddy, please use node 18
2. In stylebuddy-angular-lib root: `npm i` and then `ng build --watch`
3. Run your application: `ng s` (execute in your app root, e.g. `demospa`)
4. You can now modify code in this library and sample hosting application should reload automatically

# Publishing
To build & publish the library:
1. Run `ng build --configuration production`
2. Go to `dist/stylebuddy`
3. `npm pack`
4. (optional) edit `.npmrc` to update npm repository location
5. `npm publish`
  * To unpublish a version `npm unpublish @cx-spartacus/stylebuddy@0.0.1`
  * If you overwrote a version remove `package-lock.json` and `node-modules/@cx-spartacus/stylebuddy` in your app, run `npm i --prefer-online`

