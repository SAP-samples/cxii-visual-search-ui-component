import { Converter } from "@spartacus/core";
import { VisualSearchImageAnalysisResponse, VisualSearchRecommendation, VisualSearchSimilarProducts } from "../../models/object-detection.model";

export class VisualSearchConverterSet {
  constructor(
    public imageAnalysisConverter: Converter<any, VisualSearchImageAnalysisResponse>,
    public recommendationsConverter: Converter<any, VisualSearchRecommendation>,
    public similarProductsConverter: Converter<any, VisualSearchSimilarProducts>,
  ) {

  }
}
