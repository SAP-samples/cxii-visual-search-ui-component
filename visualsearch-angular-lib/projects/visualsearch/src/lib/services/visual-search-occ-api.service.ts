import {Injectable} from "@angular/core";
import {VisualSearchApiService} from "./visual-search-api.service";
import {HttpClient} from "@angular/common/http";


@Injectable
export class VisualSearchOccApiService extends VisualSearchApiService {

  constructor(
    private http: HttpClient,
    
  ) {
    super();
  }
}
