import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../models/Purchase';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../models/PaymentInfo';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseURL: string =
    environment.eCommerceAppUrl + '/checkout/purchase';

  private paymentIntentURL =
    environment.eCommerceAppUrl + '/checkout/payment-intent';

  constructor(private readonly httpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseURL, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(
      this.paymentIntentURL,
      paymentInfo
    );
  }
}
