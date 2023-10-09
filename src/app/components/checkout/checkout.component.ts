import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CartService } from 'src/app/services/cart.service';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0.0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private readonly shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.initializeFormGroup();
    this.updateStatus();
    this.initializeCreditCardYearsAndMonths();
  }

  updateStatus() {}

  copyShippingToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  onSubmit() {
    console.log(`submit button works`);
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }

  initializeCreditCardYearsAndMonths() {
    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.shopService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));

    //populate credit card years
    this.shopService
      .getCreditCardYears()
      .subscribe((data) => (this.creditCardYears = data));
  }

  handleMonthsAndYear() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCardInfo');
    const currentYear: number = new Date().getFullYear();

    const selectedYear: number = Number(
      creditCardFormGroup?.value.expirationYear
    );

    let startMonth: number = 0;
    if (selectedYear === currentYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }

  initializeFormGroup(): FormGroup {
    return this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        city: [''],
        street: [''],
        state: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        city: [''],
        street: [''],
        state: [''],
        zipCode: [''],
      }),
      creditCardInfo: this.formBuilder.group({
        cardType: [''],
        cardName: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });
  }
}
