import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppValidator } from 'src/app/Validators/Validators';
import { Country } from 'src/app/models/Country';
import { State } from 'src/app/models/State';
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
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private readonly shopService: ShopService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.initializeFormGroup();
    this.updateStatus();
    this.initializeCreditCardYearsAndMonths();
    this.initializeCountrie();
  }

  updateStatus() {
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
  }

  copyShippingToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      //bug fix code
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //bug fix
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
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

  initializeCountrie() {
    this.shopService
      .getCountries()
      .subscribe((data) => (this.countries = data));
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
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          AppValidator.whitespaceValidator,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          AppValidator.whitespaceValidator,
        ]),
        email: new FormControl('', AppValidator.EMAIL_VALIDATION),
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', Validators.required),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          AppValidator.whitespaceValidator,
        ]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          AppValidator.whitespaceValidator,
        ]),
        state: new FormControl('', Validators.required),
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', Validators.required),
        city: [''],
        street: [''],
        state: new FormControl('', Validators.required),
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
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.shopService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      //select first state as default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
}
