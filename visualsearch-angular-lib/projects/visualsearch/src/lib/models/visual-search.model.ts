import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
export interface Result {
  product_id?: string;
  vector_score?: string;
}

export interface Image {
  product: ProductImage;
}

export interface ProductImage {
  id?: string;
  name?: string;
  url?: SafeUrl;
}
export interface LibraryProducts {
  products:               LibraryProduct[];
}

export interface LibraryProduct {
  image_id:               string;
  image_name?:            string;
  image_url:              string;
  image_src?:             string;
  gender?:                string;
  category?:              string;
}
