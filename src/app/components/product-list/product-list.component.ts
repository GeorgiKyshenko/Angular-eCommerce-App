import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import {
  GetResponseProducts,
  ProductService,
} from 'src/app/services/product.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-product-list',
  // templateUrl: './product-list.component.html',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products!: Product[];
  categoryId!: number;
  previousCategoryId!: number;
  currentCategoryName!: string;
  searchMode!: boolean;
  pageNumber: number = 1;
  pageSize: number = 12;
  pageTotalElements: number = 0;

  constructor(
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listOfProducts();
    });
  }

  listOfProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }
  handleSearchProducts() {
    const keyword = this.route.snapshot.paramMap.get('keyword')!;

    this.productService.searchProducts(keyword).subscribe((data) => {
      this.products = data;
    });
  }

  handleListProducts2() {
    const hasCategoryId = this.route.snapshot.paramMap.has('id');
    const hasCategoryName = this.route.snapshot.paramMap.has('name');

    if (hasCategoryId && hasCategoryName) {
      this.categoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;

      this.productService
        .getProductListByCategory(this.categoryId)
        .subscribe((data) => {
          this.products = data;
        });
      //1.Check if we have different category than previous
      //Angular will reuse a component if it is currently being viewed

      //2.if we have different category then previous, then set the page number to 1

      if (this.previousCategoryId !== this.categoryId) {
        this.pageNumber = 1;
      }
      this.previousCategoryId = this.categoryId;
    } else {
      this.productService
        .getProductListPaginated(
          this.pageNumber - 1,
          this.pageSize,
          this.categoryId
        )
        .subscribe((data) => {
          this.products = data._embedded.products;
          this.pageNumber = data.page.number + 1;
          this.pageSize = data.page.size;
          this.pageTotalElements = data.page.totalElements;
        });
    }
  }

  handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    const hasCategoryName = this.route.snapshot.paramMap.has('name');

    if (hasCategoryId && hasCategoryName) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.categoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      // not category id available ... default to category id 1
      // this.categoryId = 1;
      this.productService
        .getAllProductListPaginated(this.pageNumber - 1, this.pageSize)
        .subscribe((data) => {
          this.products = data._embedded.products;
          this.pageNumber = data.page.number + 1;
          this.pageSize = data.page.size;
          this.pageTotalElements = data.page.totalElements;
        });
    }

    //
    // Check if we have a different category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.categoryId) {
      this.pageNumber = 1;
    }

    this.previousCategoryId = this.categoryId;

    // now get the products for the given category id
    this.productService
      .getProductListPaginated(
        this.pageNumber - 1,
        this.pageSize,
        this.categoryId
      )
      .subscribe((data) => {
        this.products = data._embedded.products;
        this.pageNumber = data.page.number + 1;
        this.pageSize = data.page.size;
        this.pageTotalElements = data.page.totalElements;
      });
  }
}
