import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    // Only add an access token for secured endpoint
    const envBaseUrl = environment.eCommerceAppUrl + '/orders';
    const securedEndpoint = [envBaseUrl];

    if (securedEndpoint.some((url) => request.urlWithParams.includes(url))) {
      // get the access token
      const accessToken = this.oktaAuth.getAccessToken();

      // clone the request to change its header with added acces token (request are immutable)
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken,
        },
      });
    }
    // "go ahead and continue with the next interceptors that are in the chain". If there arent any it will just make the call to the given Rest API (URL/ENDPOINT)
    return await lastValueFrom(next.handle(request));
  }
}
