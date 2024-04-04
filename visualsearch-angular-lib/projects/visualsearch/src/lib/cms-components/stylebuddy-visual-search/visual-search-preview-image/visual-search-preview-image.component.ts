import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {VisualSearchService} from "../../../services/visual-search.service";
import {VisualSearchDataService} from "../../../services/visual-search-data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {async, BehaviorSubject, Observable, of} from "rxjs";
import {
  ENTIRE_IMAGE_CATEGORY,
  ObjectDetectionCategory,
  VisualSearchRecommendationSet
} from "../../../models/object-detection.model";
import {catchError, finalize, map, take, tap} from "rxjs/operators";
import {Image} from "@spartacus/core";
import {FileUploadService} from "../../../services/file-upload-service";

@Component({
  selector: 'lib-visual-search-preview-image',
  templateUrl: './visual-search-preview-image.component.html',
  styleUrls: ['./visual-search-preview-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualSearchPreviewImageComponent {
  uploadedFileUrl:any;
  fileName:string;
  previewImageData:any;
  imageAnalysis$: Observable<any>;
  selectedCategory$: Observable<ObjectDetectionCategory>;
  imageBeingUploaded$: Observable<boolean>;
  sessionImage$: Observable<Image>;
  busy$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<any>(null);
  selectedSet$: Observable<VisualSearchRecommendationSet>;
  mediaBaseUrl: string;

  constructor(private sanitizer: DomSanitizer,
              private visualSearchService: VisualSearchService,
              private fileUploadService: FileUploadService,
              private dataService: VisualSearchDataService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.mediaBaseUrl = this.visualSearchService.getMediaBaseUrl();
    this.uploadedFileUrl = this.dataService.getUploadFileUrl();
    this.fileName = this.dataService.getFileName();
    this.previewImageData = this.dataService.getPreviewImageData();
    this.selectedCategory$ = this.visualSearchService.getSelectedCategory();
    console.table(this.uploadedFileUrl);
    this.sessionImage$ = this.fileUploadService.getCurrentSessionImage();
    this.imageBeingUploaded$ = this.visualSearchService.getImageUploadingFlag();
    if (this.dataService.isOjectDetectionEnabled) {
      this.imageAnalysis$ = this.visualSearchService.getImageAnalysis().pipe(
        map((data) => {
          if (!data) {
            //means that object detection call should be in progress
            return null;
          }

          if (
            data.categories?.length &&
            data.categories[0].centerX != null &&
            data.categories[0].bboxBottom != null
          ) {
            return data;
          }

          //no object detection rectangles available, just image parts
          return { categories: [] };
        }),
        tap((data) => {
          if(data) {
            if (data.categories.length === 0) {
              //object detection failed, select entire image automatically
              this.selectCategory(ENTIRE_IMAGE_CATEGORY);
            } else if (data.categories.length === 1) {
              //only one object detected, select it automatically
              this.selectCategory(data.categories[0]);
            }
          }
        })
      );
    } else {
      this.fileUploadService.getCurrentSessionImage().pipe(
        take(1)
      ).subscribe(image => {
        let target:ObjectDetectionCategory = {code: "", uid: "", imageUrl: this.mediaBaseUrl.concat(image.url)};
        if(image)
          this.selectCategory(target);
      })
    }

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

  goBack(event: Event) {
    this.selectCategory(null);
    this.router.navigate(['../welcome'], { relativeTo: this.activatedRoute })
  }

  selectCategory(detectedObject: ObjectDetectionCategory) {
    this.visualSearchService.selectCategory(detectedObject);
  }

  protected readonly async = async;
}
