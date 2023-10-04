import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  //this URL is set automatically in Spring Data Rest. Autocreated paths for products and category also, query params for size,page,sort
  private baseUrl = 'http://localhost:8080/api/products';
  private allProductsUrl = 'http://localhost:8080/api/products?size=100';
  private productsCategoryURL = 'http://localhost:8080/api/product-category';

  constructor(private readonly httpClient: HttpClient) {}

  getProductListPaginated(
    page: number,
    pageSize: number,
    categoryId: number
  ): Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getAllProductListPaginated(
    page: number,
    pageSize: number
  ): Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}?page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductListByCategory(categoryId: number): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`;

    return this.getProducts(searchUrl);
  }

  getAllProductsList(): Observable<Product[]> {
    return this.httpClient
      .get<GetResponseProducts>(this.allProductsUrl)
      .pipe(map((response) => response._embedded.products));
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductsCategory>(this.productsCategoryURL)
      .pipe(map((response) => response._embedded.productCategory));
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;

    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(
    page: number,
    pageSize: number,
    keyword: string
  ): Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}&page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductDetails(productId: number): Observable<Product> {
    const productDetailsUrl = `${this.baseUrl}/${productId}`;

    return this.httpClient.get<Product>(productDetailsUrl);
  }

  private getProducts(searchUrl: string) {
    return this.httpClient
      .get<GetResponseProducts>(searchUrl)
      .pipe(map((response) => response._embedded.products));
  }
}

export interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductsCategory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
