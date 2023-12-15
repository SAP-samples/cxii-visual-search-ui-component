import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LibraryProduct, Result} from "../../../models/visual-search.model";
import {VisualSearchService} from "../../../services/visual-search.service";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'lib-image-search',
  templateUrl: './image-search.component.html',
  styleUrls: ['./image-search.component.scss']
})
export class ImageSearchComponent implements OnInit {

  uploadedFile: File;
  uploadedFileUrl: any;
  fileSize: any;
  searchResults: Result[];
  products: LibraryProduct[];
  loading = false;

  constructor(
    private visualSearchService: VisualSearchService,
    private dataService: VisualSearchDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetect: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
  }

  confirmImage(file: File): void {
    this.loading = true;
    this.visualSearchService.uploadSessionImage(file).then((res) => {
      console.log(res);
      res.subscribe(
        {
          next: (response: Result[]) => {
            this.searchResults = response;
            this.dataService.setSearchResults(this.searchResults);
            this.loading = false;
            this.router.navigate(['/visual-search/results'], {relativeTo: this.activatedRoute})
          },
          error: (err: any) => {
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

  setUploadedFile(file: File) {
    let reader = new FileReader();
    this.uploadedFile = file;
    this.fileSize = Math.round(file.size / 100) / 10 > 1000
      ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
      : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.uploadedFileUrl = reader.result;
      this.dataService.setFileName(file.name);
      this.dataService.setUploadFileUrl(this.uploadedFileUrl);
      this.changeDetect.detectChanges();
    };
    this.confirmImage(file);
  }

  public onFileSelected(event: Event): void {
    this.router.navigate(['/'], {relativeTo: this.activatedRoute});
    const inputElement = event.target as HTMLInputElement;
    this.setUploadedFile(this.findFirstImageFile(inputElement.files));
  }
}
