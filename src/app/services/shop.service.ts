import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../models/Country';
import { State } from '../models/State';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private countriesURL = `${environment.eCommerceAppUrl}/countries`;
  private statesURL = `${environment.eCommerceAppUrl}/states`;

  constructor(private readonly http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http
      .get<GetCountriesResponse>(this.countriesURL)
      .pipe(map((response) => response._embedded.countries));
  }

  getStates(countryCode: string): Observable<State[]> {
    const getStatesByCountryCodeURL = `${this.statesURL}/search/findStateByCountryCode?code=${countryCode}`;

    return this.http
      .get<GetStatesResponse>(getStatesByCountryCodeURL)
      .pipe(map((response) => response._embedded.states));
  }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    //build an array from Month dropdown list
    //looping from current Month until the last
    for (let month = startMonth; month <= 12; month++) [data.push(month)];
    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let year = startYear; year <= endYear; year++) [data.push(year)];
    return of(data);
  }
}

interface GetCountriesResponse {
  _embedded: {
    countries: Country[];
  };
}

interface GetStatesResponse {
  _embedded: {
    states: State[];
  };
}
