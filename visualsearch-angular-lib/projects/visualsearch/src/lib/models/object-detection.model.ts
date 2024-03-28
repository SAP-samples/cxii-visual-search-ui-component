export interface VisualSearchImageAnalysisResponse {
  categories: ObjectDetectionCategory[];
  //if not empty, it is checked vs ImageWsDTO.altText to see if stored analysis is for the same image
  //in occ api altText contains modifiedtime
  id?: string;
  expires?: number;
}
export interface ObjectDetectionCategory {
  //this must be unique across all returned suggestions
  uid: string;
  //in new api there can be several results for "shoes" etc
  code: string;
  imageUrl?: string;
  imageId?: string;
  gender?: string;

  bboxLeft?: number;
  bboxRight?: number;
  bboxTop?: number;
  bboxBottom?: number;

  centerX?: number;
  centerY?: number;
  score?: number;
}

export interface VisualSearchSimilarProducts {
  categoryCode: string;
  products: VisualSearchRecommendationProduct[];
}

export interface VisualSearchRecommendationSet {
  id: string;
  name: string;
  score: number;
  products: VisualSearchRecommendationProduct[]
}

export interface VisualSearchRecommendationProduct {
  code: string;
  score?: number;
}

export interface VisualSearchRecommendation {
  categoryCode: string;
  gender: string;
  sets: VisualSearchRecommendationSet[];
}

export interface VisualSearchSimilarProducts {
  categoryCode: string;
  products: VisualSearchRecommendationProduct[];
}

export const ENTIRE_IMAGE_CATEGORY: ObjectDetectionCategory = {
  uid: 'entire-image',
  code: 'entire-image',
  imageUrl: '',
  centerX: 0.5,
  centerY: 0.5,
  bboxBottom: 1,
  bboxLeft: 0,
  bboxRight: 1,
  bboxTop: 0,
}
