import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../models/Purchase';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseURL: string = 'http://localhost:8080/api/checkout/purchase';

  constructor(private readonly httpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseURL, purchase);
  }
}
