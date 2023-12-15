import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { I18nModule, UrlModule, provideDefaultConfig } from '@spartacus/core';
import {
  DIALOG_TYPE,
  IconModule,
  ItemCounterModule,
  LayoutConfig,
  PromotionsModule,
  SpinnerModule,
} from '@spartacus/storefront';
import { AddedManyToCartDialogComponent } from './added-many-to-cart-dialog.component';
import { LAUNCH_DIALOGS } from '../../extra-spartacus-components/extra-spartacus-components.module';

@NgModule({
    declarations: [AddedManyToCartDialogComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        SpinnerModule,
        PromotionsModule,
        UrlModule,
        IconModule,
        I18nModule,
        ItemCounterModule,
    ],
    exports: [AddedManyToCartDialogComponent],
    providers: [
        provideDefaultConfig(<LayoutConfig>{
            //provider for new launch dialog
            launch: {
                [LAUNCH_DIALOGS.VS_ADDED_MANY_TO_CART]: {
                    inlineRoot: true,
                    component: AddedManyToCartDialogComponent,
                    dialogType: DIALOG_TYPE.DIALOG,
                },
            },
        }),
    ]
})
export class AddedManyToCartDialogModule {}
