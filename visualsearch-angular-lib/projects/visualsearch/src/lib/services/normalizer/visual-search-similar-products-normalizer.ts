import {Injectable} from '@angular/core';
import {Converter} from '@spartacus/core';
import {VisualSearchRecommendationProduct, VisualSearchSimilarProducts} from '../../models/object-detection.model';
// import {mockProductIfEnabled} from '../utils/mock-products';

@Injectable({ providedIn: 'root' })
export class VisualSearchSimilarProductsNormalizer
  implements Converter<any, VisualSearchSimilarProducts>
{
  constructor() {}

  convert(
    rawResponse: any,
    response?: VisualSearchSimilarProducts
  ): VisualSearchSimilarProducts {
    if (response === undefined) {
      response = {
        categoryCode: '',
        products: [],
      };
    }

    (rawResponse['products'] || []).forEach((rawProduct) => {
      const product: VisualSearchRecommendationProduct = {
        code: rawProduct['product_id'],
        //vector_score is reversed here, it seems
        score: 1 - parseFloat(rawProduct['vector_score']),
      }
      response.products.push(product);
      /*if(!product.score || product.score >= this.config['styleBuddy'].similarProductMinScore) {
        mockProductIfEnabled(product, this.config['styleBuddy']);
        response.products.push(product);
      } else {
        console.debug(['styleBuddy'], 'product ', product, ' rejected because of low score ')
      }*/
    });

    return response;
  }
}
