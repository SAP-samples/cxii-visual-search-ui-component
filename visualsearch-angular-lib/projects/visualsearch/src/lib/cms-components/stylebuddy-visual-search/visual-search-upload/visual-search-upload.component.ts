import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {VisualSearchService} from "../../../services/visual-search.service";
import {LibraryProduct, LibraryProducts, Result} from "../../../models/visual-search.model";
import {ActivatedRoute, Router} from "@angular/router";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import {mockLibraryProducts} from "../../../models/mockData";
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {catchError, finalize, take} from "rxjs/operators";
import {FileUploadService} from "../../../services/file-upload-service";
import {HttpEventType, HttpResponse} from "@angular/common/http";

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
  sub!: Subscription;
  busy$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<any>(null);
  isObjectDetectionEnabled: boolean = false;

  @Input() showSamples;

  constructor(
    private visualSearchService: VisualSearchService,
    private fileUploadService: FileUploadService,
    private dataService: VisualSearchDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetect: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setObjectDetection(false)
    const prods: LibraryProducts = mockLibraryProducts();
    this.products = prods.products.map((prod) => {
      const url = prod.image_url.replace("{image_id}", prod.image_id+".png");
      prod.image_url = url;
      return prod;
    })
    this.changeDetect.detectChanges();
  }

  setUploadedFile(file: File, event: any) {
    let reader = new FileReader();
    if(file.size <= this.visualSearchService.getMaxFileSize()) {
      this.uploadedFile = file;
      this.fileSize = Math.round(file.size / 100) / 10 > 1000
        ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
        : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.uploadedFileUrl = reader.result;
        this.dataService.setUploadFileUrl(this.uploadedFileUrl);
        this.dataService.setFileName(file.name);
        this.dataService.setFile(file)
        this.changeDetect.detectChanges();
      };
      this.confirmImage(file);
    } else {
      // Setting this to null as after alert, file upload event is not getting triggered
      event.target.value = null;
      const fileSize = this.visualSearchService.formatFileSize(file.size);
      alert(`Selected image is too large (${fileSize}), maximum allowed size is ${this.visualSearchService.getMaxFileSizeHumanReadable()}`)
    }
  }

  doVisualSearch(product) {
    this.visualSearchService.visualSearch(product, false);
  }

  // Object Detection Changes...
  confirmImage(file: File):void {
    this.loading = true
    this.fileUploadService.uploadSessionImage(file).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('Uploading...');
        } else if (event instanceof HttpResponse) {
          console.log("Uploaded... ", event)
          this.imageResponse = event.body;
          this.loading = false;
          this.fileUploadService.getCurrentSessionImage().subscribe({
            next: (image: any) => {
              console.log(image);
              if (image) {
                this.visualSearchService.setPreviewImageData(image);
                if (this.dataService.isOjectDetectionEnabled) {
                  this.visualSearchService.removeImageAnalysis();
                  this.startAnalyze();
                }
                this.router.navigate(['../results'], { relativeTo: this.activatedRoute })
              }
            }
          });
        }
      },
      error: (err: any) => {
        console.error("Error while uploading...");
      }
    });
  }

  startAnalyze() {
    this.error$.next(null);
    this.busy$.next(true);
    this.visualSearchService.fetchImageAnalysis(true).pipe(
      take(1),
      catchError(error => {
        this.error$.next(error);
        return of(null);
      }),
      finalize(() => {
        this.busy$.next(false);
      })
    ).subscribe();
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
    this.setUploadedFile(this.findFirstImageFile(inputElement.files), event);
  }

  public imageSelected(product:LibraryProduct) {
    this.doVisualSearch(product);
  }

  toggleObjectDetection(event: Event) {
    this.isObjectDetectionEnabled = !this.isObjectDetectionEnabled;
    this.dataService.isOjectDetectionEnabled = this.isObjectDetectionEnabled;
  }

  setObjectDetection(flag: boolean) {
    this.isObjectDetectionEnabled = flag;
    this.dataService.isOjectDetectionEnabled = flag;
  }

}
