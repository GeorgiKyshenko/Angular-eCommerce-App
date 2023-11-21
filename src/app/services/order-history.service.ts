import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrderHistory } from '../models/OrderHistory';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderURL = `${environment.eCommerceAppUrl}/orders`;

  constructor(private readonly httpClient: HttpClient) {}

  getOrderHistory(userEmail: string): Observable<GetResponseOrderHistory> {
    const orderHistoryURL = `${this.orderURL}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${userEmail}`;
    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryURL);
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  };
}
