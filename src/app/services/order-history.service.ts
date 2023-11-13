import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrderHistory } from '../models/OrderHistory';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderURL = 'http://localhost:8080/api/orders';

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
