import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/models/CartItem';
import { CartService } from 'src/app/services/cart.service';

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
  previousKeyword!: string;
  searchMode!: boolean;
  pageNumber: number = 1;
  pageSize: number = 8;
  pageTotalElements: number = 0;

  constructor(
    private readonly productService: ProductService,
    private readonly cartService: CartService,
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

    //if we have different keyword than previous, then set the page number to 1
    //in this logic if you search produc by its name and go to page 3 for example and press search with the exact same word
    // you will stay on the same page. Only if you search a new product by different keyword then u are redirected to page number 1 of that product match.
    if (this.previousKeyword !== keyword) {
      this.pageNumber = 1;
    }
    this.previousKeyword = keyword;

    this.productService
      .searchProductsPaginate(this.pageNumber - 1, this.pageSize, keyword)
      .subscribe(this.processResult());
  }

  handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    const hasCategoryName = this.route.snapshot.paramMap.has('name');

    if (hasCategoryId && hasCategoryName) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.categoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;

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
        .subscribe(this.processResult());
    } else {
      //IN REAL APP ITS BETTER TO THROW ERROR IN ELSE CLAUSE WHEN NO ID OR NAME WAS FOUND!

      // not category id available = list all products paginated!
      this.productService
        .getAllProductListPaginated(this.pageNumber - 1, this.pageSize)
        .subscribe(this.processResult());
    }
  }

  updatePageSize(pageSize: string) {
    this.pageSize = Number.parseInt(pageSize);
    this.pageNumber = 1;
    this.listOfProducts();
  }

  addToCart(product: Product) {
    const cartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }

  private processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.pageTotalElements = data.page.totalElements;
    };
  }
}
