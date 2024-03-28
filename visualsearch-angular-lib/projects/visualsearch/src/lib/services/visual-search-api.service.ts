import {Observable} from "rxjs";
import {ObjectDetectionCategory} from "../models/object-detection.model";


export abstract class VisualSearchApiService {
  abstract analyzeImage(imageId: string): Observable<any>;
  abstract findSimilarproducts(
    category: ObjectDetectionCategory,
    limit?: number
  ): Observable<any>;
  abstract getPublicImageUrl(imageId: string): string
}
