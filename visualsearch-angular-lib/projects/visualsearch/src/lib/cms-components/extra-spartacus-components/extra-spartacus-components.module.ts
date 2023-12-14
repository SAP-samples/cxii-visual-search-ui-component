import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddedManyToCartDialogModule } from './added-many-to-cart-dialog/added-many-to-cart-dialog.module';
import { ExternalProductVariantsModule } from './product-variants/external-product-variants.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AddedManyToCartDialogModule,
    ExternalProductVariantsModule,
  ],
  exports: [
    ExternalProductVariantsModule,
    AddedManyToCartDialogModule
  ]
})
export class ExtraSpartacusComponentsModule { }

export const enum LAUNCH_DIALOGS {
  VS_ADDED_MANY_TO_CART = 'VS_ADDED_MANY_TO_CART'
}
