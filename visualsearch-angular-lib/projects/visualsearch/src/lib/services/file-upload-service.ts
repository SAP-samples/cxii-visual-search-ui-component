import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient, HttpEvent, HttpRequest, HttpResponse} from "@angular/common/http";
import {BaseSiteService, Image, OccEndpointsService, WindowRef} from "@spartacus/core";
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {finalize, switchMap, tap} from "rxjs/operators";
import {VisualSearchService} from "./visual-search.service";

@Injectable({
  providedIn: 'root'
})

export class FileUploadService implements OnDestroy{
  private visualSearchSessionId: string;
  private sessionIdStorageKey: string;
  private imageChangeNotification$ = new BehaviorSubject<Image>(null);
  private imageUploading$ = new BehaviorSubject<boolean>(false);
  private subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private winRef: WindowRef,
    private baseSiteService: BaseSiteService,
    private occEndpoints: OccEndpointsService,
    private visualSearchService: VisualSearchService
  ) {
    this.subscription.add(
      this.baseSiteService.getActive().subscribe((site) => {
        this.sessionIdStorageKey = `cxaiImageSessionId_${site}`;
        this.visualSearchSessionId = winRef.localStorage?.getItem(
          this.sessionIdStorageKey
        );
        if (!this.visualSearchSessionId) {
          this.storeSessionId(this.generateSessionId(4));
        }
      })
    );
  }

  uploadSessionImage(file: File): Observable<HttpEvent<any>> {
    this.visualSearchService.getDynamicToken().subscribe({
      next: (token) => {
        console.log('token', token)
      }
    });
    const formData = new FormData();
    formData.append('file', file);
    const url = this.occEndpoints.buildUrl(
      `/cxai/image/upload/${this.visualSearchSessionId}`
    );

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return of(req).pipe(
      tap(() => this.imageUploading$.next(true)),
      switchMap((request) => this.http.request(request)),
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.imageChangeNotification$.next(event.body);
        }
      }),
      finalize(() => {
        this.imageUploading$.next(false);
      })
    );
  }

  protected storeSessionId(sessionId: string) {
    if (!this.sessionIdStorageKey) {
      throw new Error('BaseSiteService not initialized');
    }

    this.visualSearchSessionId = sessionId;
    this.winRef.localStorage?.setItem(
      this.sessionIdStorageKey,
      this.visualSearchSessionId
    );
  }

  protected generateSessionId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0)
        .toString(16)
        .substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  getCurrentSessionImage(): Observable<Image> {
    return this.imageChangeNotification$.pipe(
      switchMap((image) => {
        const url = this.occEndpoints.buildUrl(
          `/cxai/image/${this.visualSearchSessionId}`
        );
        return this.http.get<Image>(url);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.sessionIdStorageKey = undefined;
    this.visualSearchSessionId = undefined;
  }
}
