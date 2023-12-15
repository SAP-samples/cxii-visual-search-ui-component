# VisualSearchAngularLib

1. Create a sample page with visual search component
```csv
$contentCatalog = fashion-spaContentCatalog
$version = Online
$contentCV = catalogVersion(CatalogVersion.catalog(Catalog.id[default=$contentCatalog]), CatalogVersion.version[default=$version])[default=$contentCatalog:$version]
$lang = en
$picture = media(code, $contentCV) ;

$siteResource = jar:com.hybris.demo.demosampledata.constants.DemosampledataConstants&/demosampledata/import/sampledata/contentCatalogs/fashion-spaContentCatalog/images


INSERT_UPDATE CMSFlexComponent; $contentCV[unique = true]; uid[unique = true]        ; name                      ; flexType
                              ;                          ; VisualSearchComponent ; VisualSearchComponent ; VisualSearchComponent

INSERT_UPDATE ContentSlot; $contentCV[unique = true]; uid[unique = true]   ; name                           ; active; cmsComponents(uid, $contentCV); ; ;
                         ;                          ; Section2ASlot-VS ; Section2A Slot for VS ; true  ; VisualSearchComponent     ; ; ;

INSERT_UPDATE ContentSlotForPage; $contentCV[unique = true]; uid[unique = true]; position[unique = true]; page(uid, $contentCV)[unique = true]; contentSlot(uid, $contentCV)[unique = true]; ; ;
                                ;                          ; Section2A-VS  ; Section2A              ; visualSearchPage                          ; Section2ASlot-VS                       ; ; ;

INSERT_UPDATE ContentPage; $contentCV[unique = true]; uid[unique = true]   ; name                    ; masterTemplate(uid, $contentCV); label        ; defaultPage[default = 'true']; approvalStatus(code)[default = 'approved']; homepage[default = 'false']; title[lang = $lang]
                         ;                          ; visualSearchPage ; Visual Search Page ; ContentPage1Template           ; /visual-search ;                              ;                                           ;                            ; "Visual Search"



```

## Frontend
1. Add `@cx-spartacus/visualsearch` dependency to your app's `package.json`
  * if you don't have npm repository you can use tgz files from [s3 url] or you can build the library tgz yourself as described in [Development](#Development)
2. Import `StylebuddyVisualSearchModule` to `app.module`
```ts
    @NgModule({imports:[`StylebuddyVisualSearchModule`]})
```

1. `npm i` in projects/visualsearch, please use node 18
2. In visualsearch-angular-lib root: `npm i` and then `ng build --watch`
3. Run your application: `ng s` (execute in your app root, e.g. `demospa`)
4. You can now modify code in this library and sample hosting application should reload automatically

# Publishing
To build & publish the library:
1. Run `ng build --configuration production`
2. Go to `dist/visualsearch`
3. `npm pack`

  * If you overwrote a version remove `package-lock.json` and `node-modules/@cx-spartacus/visualsearch` in your app, run `npm i --prefer-online`

