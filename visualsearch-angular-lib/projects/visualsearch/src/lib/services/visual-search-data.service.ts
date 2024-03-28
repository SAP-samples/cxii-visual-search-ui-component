import { Injectable } from '@angular/core';
import {Result} from "../models/visual-search.model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class VisualSearchDataService {

  private _searchResults: Result[];
  private _uploadFileUrl: any;
  private _fileName: string;
  private _previewImageData: any;
  private _file: File;
  private _isOjectDetectionEnabled: boolean;
  constructor(
    private http: HttpClient
  ) { }

  setSearchResults(data: Result[]) {
    this._searchResults = data;
  }

  getSearchResults(): Result[] {
    return this._searchResults || []
  }


  getUploadFileUrl(): any {
    return this._uploadFileUrl;
  }

  setUploadFileUrl(value: any) {
    this._uploadFileUrl = value;
  }

  getFileName(): string {
    return this._fileName;
  }

  setFileName(value: string) {
    this._fileName = value;
  }

  getData(): Observable<string[]> {
    return this.http.get<string[]>('https://jsonplaceholder.typicode.com/todos/1');
  }

  getPreviewImageData(): any {
    return this._previewImageData;
  }

  setPreviewImageData(value: any) {
    this._previewImageData = value;
  }

  getFile(): File {
    return this._file;
  }

  setFile(value: File) {
    this._file = value;
  }


  get isOjectDetectionEnabled(): boolean {
    return this._isOjectDetectionEnabled;
  }

  set isOjectDetectionEnabled(value: boolean) {
    this._isOjectDetectionEnabled = value;
  }
}
