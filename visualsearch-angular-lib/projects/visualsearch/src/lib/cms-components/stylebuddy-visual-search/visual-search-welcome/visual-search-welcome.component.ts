import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'lib-visual-search-welcome',
  templateUrl: './visual-search-welcome.component.html',
  styleUrls: ['./visual-search-welcome.component.scss']
})
export class VisualSearchWelcomeComponent implements OnInit {
  showUpload:boolean = false;
  showSamples:boolean = false;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    console.log("Hello")
  }

  showUploadContainer(): void {
    // this.router.navigate(['../upload'], { relativeTo: this.activatedRoute })
    this.showUpload = true;
    // alert(this.showSamples)
    this.showSamples = true;
  }

  showGoogleContainer(): void {
    // this.router.navigate(['../upload'], { relativeTo: this.activatedRoute })
    this.showUpload = true;
    this.showSamples = false;
  }

}
