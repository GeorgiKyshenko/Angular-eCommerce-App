import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {}

  doSearch(value: string) {
    if (value) {
      this.router.navigateByUrl(`/search/${value}`);
    } else {
      this.router.navigateByUrl(`/products`);
    }
  }
}
