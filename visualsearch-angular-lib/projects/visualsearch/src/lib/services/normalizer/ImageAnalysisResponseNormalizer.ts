import {Injectable} from "@angular/core";
import {Converter} from "@spartacus/core";
import {ObjectDetectionCategory, VisualSearchImageAnalysisResponse} from "../../models/object-detection.model";

@Injectable({ providedIn: 'root'})
export class ImageAnalysisResponseNormalizer implements Converter<any, VisualSearchImageAnalysisResponse>{
  constructor() {
  }

  convert(rawResponse: any, response?: VisualSearchImageAnalysisResponse): VisualSearchImageAnalysisResponse {
    if(response === undefined) {
      response = {
        categories: [],
      };
    }

    const categoryCodeMap: {[key: string]: number} = {};
    rawResponse['input_attributes'].forEach((attribute) => {
      if(attribute['attribute_name'] === 'name') {
        const fileName = attribute['attribute_value'];
        //extract modifiedtime, note that filename is set in
        //com.hybris.stylebuddyservices.service.impl.VisionApiStyleBuddyService.analyzeImage(String)
        const match = fileName?.match(/^(\d+)_/);
        if(match) {
          response.id = match[1];
        }
      }
    });

    rawResponse['objects'].forEach((object) => {
      const categoryCode = object['object_name'];
      categoryCodeMap[categoryCode] = (categoryCodeMap[categoryCode] || 0) + 1;

      const category: ObjectDetectionCategory = {
        //in case there are several results name repetitions with x2, x3 etc
        uid: categoryCodeMap[categoryCode] === 1 ? categoryCode : categoryCode + categoryCodeMap[categoryCode],
        code: categoryCode,
        imageUrl: null,
        imageId: null,
        gender: null,
      };

      object['object_attributes'].forEach((attribute) => {
        const { attribute_name: attributeName, attribute_value: attributeValue } = attribute;
        switch(attributeName) {
          case 'image_id':
            category.imageId = attributeValue;
            break;
          case 'gender':
            category.gender = attributeValue?.toLowerCase() === 'none' ? null : attributeValue.toLowerCase();
            break;
          case 'left_col':
            category.bboxLeft = parseFloat(attributeValue)
            break;
          case 'right_col':
            category.bboxRight = parseFloat(attributeValue)
            break;
          case 'bottom_row':
            category.bboxBottom = parseFloat(attributeValue)
            break;
          case 'top_row':
            category.bboxTop = parseFloat(attributeValue)
            break;
          case 'recommended_point_x':
            category.centerX = parseFloat(attributeValue)
            break;
          case 'recommended_point_y':
            category.centerY = parseFloat(attributeValue)
            break;
          case 'score':
            category.score = parseFloat(attributeValue)
            break;
        }
      })
      response.categories.push(category);

      /*if(!category.score || category.score >= this.config[STYLEBUDDY_CONFIG_SCOPE].objectDetectionMinScore) {
        response.categories.push(category);
      } else {
        console.debug(STYLEBUDDY_LOG_MARKER, 'category ', category, ' rejected because of low score ')
      }*/
    });
    return response;
  }

  normalizeImageAnalysisResponse(response: any): any {
    return response;
  }
}
