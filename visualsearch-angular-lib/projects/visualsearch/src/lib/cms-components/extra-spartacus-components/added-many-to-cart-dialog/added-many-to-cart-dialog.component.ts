import { Component, ElementRef, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  ActiveCartFacade,
  Cart,
  OrderEntry,
  PromotionLocation,
} from '@spartacus/cart/base/root';
import { RoutingService } from '@spartacus/core';
import { ICON_TYPE, LaunchDialogService } from '@spartacus/storefront';
import { Observable, Subscription } from 'rxjs';
import { filter, tap, map, startWith, pairwise, take } from 'rxjs/operators';
@Component({
  selector: 'cx-added-to-cart-dialog',
  templateUrl: './added-many-to-cart-dialog.component.html',
  styleUrls: ['./added-many-to-cart-dialog.component.scss']
})
export class AddedManyToCartDialogComponent {
  iconTypes = ICON_TYPE;

  entries$: Observable<OrderEntry>[] = [];
  quantityControls: UntypedFormControl[];
  entryNumbers = new Set<number>();

  cart$: Observable<Cart> = this.activeCartFacade.getActive();
  loaded$: Observable<boolean> = this.activeCartFacade.isStable().pipe(
    tap(loaded => this.modalIsOpen = this.modalIsOpen || loaded)
  );
  promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;

  modalIsOpen = false;
  storeName: string;
  subscription = new Subscription();
  @ViewChild('dialog', { read: ElementRef })
  dialog: ElementRef;

  @ViewChildren("cartItem", { read: ViewContainerRef })
  cartItems!: QueryList<ViewContainerRef>;

  formIsDirty = false;
  form: UntypedFormGroup = new UntypedFormGroup({});

  constructor(
    protected launchDialogService: LaunchDialogService,
    protected activeCartFacade: ActiveCartFacade,
    protected routingService: RoutingService,
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.launchDialogService.data$.subscribe(
        (dialogData: any) => {
          this.entries$ = dialogData.entries$;
          if(!this.entries$) {
            console.error('[stylebuddy]', 'No entries$ passed to dialog')
          }
        }
      )
    );
    this.subscription.add(
      this.routingService
        .getRouterState()
        .pipe(filter((state) => !!state.nextState))
        .subscribe(() => this.dismissModal('dismiss'))
    );

    this.quantityControls = this.entries$.map(() => null);
    for (let i = 0; i < this.entries$.length; i++) {
      const quantityControl$ = this.entries$[i].pipe(
        filter((e) => !!e),
        tap((entry) => this.entryNumbers.add(entry.entryNumber)),
        map((entry) => this.getFormControl(entry))
      );

      this.subscription.add(
        quantityControl$.subscribe((it) => (this.quantityControls[i] = it))
      );
    }

    const valueChanges$ = this.form.valueChanges.pipe(
      // tslint:disable-next-line:deprecation
      startWith(this.form.value),
      pairwise(),
      tap(([prev, next]) => {
        this.entryNumbers.forEach((entryNumber) => {
          const qtyControlId = this.getQtyControlId(entryNumber);
          if (
            prev[qtyControlId] !== undefined &&
            prev[qtyControlId] !== next[qtyControlId]
          ) {
            this.formIsDirty = true;
            this.activeCartFacade.updateEntry(entryNumber, next[qtyControlId]);

            this.form.get(qtyControlId).markAsPristine();
          }
        });

        this.formIsDirty = false;

        // we could use form.dirty flag, but cx-item-counter calls "markAsDirty()"
        // after changing field value so it resets immediately and causes a "valueChanged" bug
        // this.form.markAsPristine();
      })
    );

    this.subscription.add(valueChanges$.subscribe());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getQtyControlId(entryNumber: number) {
    return 'qty' + entryNumber;
  }

  private getFormControl(entry: OrderEntry): UntypedFormControl {
    const controlId = this.getQtyControlId(entry.entryNumber);

    if (!this.form.get(controlId)) {
      const quantity = new UntypedFormControl(entry.quantity, { updateOn: 'blur' });
      this.form.addControl(controlId, quantity);
    }
    return <UntypedFormControl>this.form.get(controlId);
  }

  dismissModal(reason?: any): void {
    this.launchDialogService.closeDialog(reason);
  }

  async ngAfterViewInit(): Promise<void> {
    //this must be lazy-loaded to avoid outlet duplication
    //TODO: convert entire lib into "feature"
    const { CartItemComponent } = await import(
      "@spartacus/cart/base/components"
    );

    this.cartItems.changes.pipe(take(1)).subscribe(cartItemPlaceholders => {
      cartItemPlaceholders.forEach((container, index) => {
        // Create the component and add it to the view
        const subscription = this.entries$[index].subscribe(entry => {
          container.clear()
          const componentRef = container.createComponent(CartItemComponent)
          componentRef.instance.compact = true;
          componentRef.instance.item = entry;
          componentRef.instance.quantityControl = this.quantityControls[index]
        })

        this.subscription.add(subscription);
      })
    })
  }
}
