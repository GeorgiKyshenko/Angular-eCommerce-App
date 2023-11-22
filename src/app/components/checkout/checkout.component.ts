import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppValidator } from 'src/app/Validators/Validators';
import { Address } from 'src/app/models/Address';
import { Country } from 'src/app/models/Country';
import { Customer } from 'src/app/models/Customer';
import { OrderDetails } from 'src/app/models/OrderDetails';
import { OrderItem } from 'src/app/models/Orderitem';
import { PaymentInfo } from 'src/app/models/PaymentInfo';
import { Purchase } from 'src/app/models/Purchase';
import { State } from 'src/app/models/State';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopService } from 'src/app/services/shop.service';
import { environment } from 'src/environments/environment';

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
  storage: Storage = sessionStorage;
  userEmail: string = '';

  //initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = { amount: 0, currency: '', receiptEmail: '' };
  cardElement: any;
  displayError: any = '';

  isDisabled: boolean = false; // not working for now

  constructor(
    private formBuilder: FormBuilder,
    private readonly shopService: ShopService,
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Setup Stripe Payment form
    this.setupStripePaymentForm();
    // read user email from browser session storage
    this.userEmail = JSON.parse(this.storage.getItem('userEmail')!);
    this.checkoutFormGroup = this.initializeFormGroup();
    this.updateStatus();
    // this.initializeCreditCardYearsAndMonths();
    this.initializeCountrie();
  }

  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element...and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');
      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }
    });
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
      return;
    }
    // set up the order
    let orderDetails = new OrderDetails(this.totalQuantity, this.totalPrice);

    //get cat items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartitems
    const orderItems: OrderItem[] = cartItems.map(
      (cartItem) => new OrderItem(cartItem)
    );

    //set up purchase (total mess im just following the steps of the course instructor but this is very very bad practices)
    let customer: Customer = this.checkoutFormGroup.controls['customer'].value;

    //mess
    let shippingAddress: Address =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(shippingAddress.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(shippingAddress.country)
    );
    shippingAddress.state = shippingState.name;
    shippingAddress.country = shippingCountry.name;

    //more mess
    let billingAddress: Address =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(billingAddress.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(billingAddress.country)
    );
    billingAddress.state = billingState.name;
    billingAddress.country = billingCountry.name;

    let purchase = new Purchase(
      customer,
      shippingAddress,
      billingAddress,
      orderDetails,
      orderItems
    );

    // compute paymentInfo
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'USD';
    this.paymentInfo.receiptEmail = purchase.customer.email;

    // if valid form: create payment intent, confirm card payment, place order
    if (
      !this.checkoutFormGroup.invalid &&
      this.displayError.textContent === ''
    ) {
      this.isDisabled = true;
      this.checkoutService
        .createPaymentIntent(this.paymentInfo)
        .subscribe((paymentIntentResponse) => {
          this.stripe
            .confirmCardPayment(
              paymentIntentResponse.client_secret,
              {
                payment_method: {
                  card: this.cardElement,
                  billing_details: {
                    email: purchase.customer.email,
                    name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                    address: {
                      line1: purchase.billingAddress.street,
                      city: purchase.billingAddress.city,
                      state: purchase.billingAddress.state,
                      postal_code: purchase.billingAddress.zipCode,
                      country: billingCountry.code,
                    },
                  },
                },
              },
              { handleAction: false }
            )
            .then((result: any) => {
              if (result.error) {
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(
                      `Your order has been received\nOrder tracking number: ${response.orderTrackingNumber}`
                    );
                    // reset the cart
                    this.resetCart();
                    this.isDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  },
                });
              }
            });
        });
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    /*
      //new Code with Stripe Element
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been recieved.\nOrder tracking number: ${response.orderTrackingNumber}`
        );
        //reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was and error: ${err.message}`);
      },
    });
    */
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalQuantity.next(0);
    this.cartService.totalPrice.next(0);
    this.cartService.persistCartItemsInStorage();

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl(`/products`);
  }
  /*
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
      */
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
        email: new FormControl(this.userEmail, AppValidator.EMAIL_VALIDATION),
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
