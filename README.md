# SAP CX Intelligence & Incubation Visual Search UI Component
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/REPO-NAME)](https://api.reuse.software/info/github.com/SAP-samples/REPO-NAME)

## Description

SAP CX Intelligence & Incubation Visual Search UI Component is an extension of SAP Commerce Storefront. 

This project contains UI library that can be integrated with Spartacus applications to get the Visual Search feature.

This is implemented using angular framework and has few core spartacus modules as dependency.

## Requirements
1. This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.2.
2. Node v18 or Node v18> is required
3. Must have spartacus and commerce storefront application

## Download and Installation
## Frontend:
1. Clone the repo `https://github.com/SAP-samples/cxii-visual-search-ui-component`
2. Go to `cxii-visual-search-ui-component/visualsearch-angular-lib/projects/visualsearch` and run `npm install`
3. Go to `cxii-visual-search-ui-component/visualsearch-angular-lib` and run `npm install`
4. Run `ng build --configuration production`
5. Go to `dist/visualsearch`
6. Run `npm pack`
7. Copy the generated `cx-spartacus-visualsearch-<version>.tzg` file to the your host application
8. Add the file as dependancy in `package.json` of host app. 
    ex: `@cx-spartacus/visualsearch": "file:cx-spartacus-visualsearch-<version>.tgz`
9. Add the following entries to the `app.module.ts` file of host app.
    a. import { StylebuddyVisualSearchModule } from '@cx-spartacus/visualsearch';
    b. Add `StylebuddyVisualSearchModule` to @NgModule({imports:[]})
## Backend:
1. Create a sample page with Visual Search component from `Hybris Administration Console`
## Known Issues
No known issues at this time
<!-- You may simply state "No known issues. -->

## How to obtain support
[Create an issue](https://github.com/SAP-samples/cxii-visual-search-ui-component/issues) in this repository if you find a bug or have questions about the content.
 
For additional support, [ask a question in SAP Community](https://answers.sap.com/questions/ask.html).

## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).

## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
