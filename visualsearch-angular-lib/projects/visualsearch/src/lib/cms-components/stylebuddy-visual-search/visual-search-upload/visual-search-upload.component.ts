import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {VisualSearchService} from "../../../services/visual-search.service";
import {LibraryProduct, LibraryProducts, Result} from "../../../models/visual-search.model";
import {ActivatedRoute, Router} from "@angular/router";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import { mockLibraryProducts } from "../../../models/mockData";
import {Observable} from "rxjs";
import * as _ from 'lodash';

@Component({
  selector: 'lib-visual-search-upload',
  templateUrl: './visual-search-upload.component.html',
  styleUrls: ['./visual-search-upload.component.scss']
})
export class VisualSearchUploadComponent implements OnInit {
  uploadedFile: File;
  uploadedFileUrl: any;
  fileSize:any;
  imageResponse: any;
  loading = false;
  searchResults: Result[]= [];
  products:LibraryProduct[];

  @Input() showSamples;

  constructor(
    private visualSearchService: VisualSearchService,
    private dataService: VisualSearchDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetect: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // alert(this.showSamples)
    const prods: LibraryProducts = mockLibraryProducts();
    this.products = prods.products.map((prod) => {
      const url = prod.image_url.replace("{image_id}", prod.image_id+".png");
      prod.image_url = url;
      return prod;
    })
    this.changeDetect.detectChanges();
  }

  setUploadedFile(file: File) {
    let reader = new FileReader();
    this.uploadedFile = file;
    this.fileSize = Math.round(file.size / 100) / 10 > 1000
      ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
      : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.uploadedFileUrl = reader.result;
      this.dataService.setUploadFileUrl(this.uploadedFileUrl);
      this.dataService.setFileName(file.name);
      this.changeDetect.detectChanges();
    };
    this.confirmImage(file);
  }

  doVisualSearch(product) {
    let test:Promise<Observable<Object>> | Observable<Object> = this.visualSearchService.visualSearch(product, false);
    test.then((response) => {
      console.log((response));
      response.subscribe({
        next: (res: Result[]) => {
          console.log(res);
          this.searchResults = res;
          this.dataService.setSearchResults(this.searchResults);
          this.router.navigate(['../results'], { relativeTo: this.activatedRoute })
        }
      })
    })
  }

  confirmImage(file: File):void {
    this.loading = true
    this.visualSearchService.uploadSessionImage(file).then((res) => {
      console.log(res);
      res.subscribe(
        {
          next: (response:Result[]) => {
            const uniqueResults = _.uniqBy(response['products'], 'product_id');
            this.searchResults['products'] = uniqueResults;
            this.dataService.setSearchResults(this.searchResults);
            this.loading = false;
            this.router.navigate(['../results'], { relativeTo: this.activatedRoute })
          },
          error: (err:any) => {
            console.error("Error while searching...");
          }
        }
      )
    })
  }

  protected findFirstImageFile(fileList: FileList) {
    const droppedFiles = Array.from(fileList || []);
    for (const file of droppedFiles) {
      if (file.type.match(/image\/*/) !== null) {
        return file;
      }
    }

    return null;
  }

  public onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.setUploadedFile(this.findFirstImageFile(inputElement.files));
  }

  public imageSelected(product:LibraryProduct) {
    /*const data = {
      image_id: product.image_id;
    }*/
    this.doVisualSearch(product);
  }

}
