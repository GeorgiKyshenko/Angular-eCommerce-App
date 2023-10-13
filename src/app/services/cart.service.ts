import { Injectable } from '@angular/core';
import { CartItem } from '../models/CartItem';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {}

  //this should call back-end api but for now is simulated with functionality only in front-end
  addToCart(cartItem: CartItem) {
    let itemAlreadyExistsInCart: boolean = false;
    let existingItemInCart: any;
    /* Option !
     if (this.cartItems.length > 0) {
       for (let item of this.cartItems) {
         if (item.id === cartItem.id) {
           existingItemInCart = item;
          // itemAlreadyExistsInCart = true;
          // item.qunatity++; instead of "existingItemInCart.qunatity++;" in case below
           break;
         }
       }
     a way to asign variable to true if another variable is undefined
      or simpli add itemAlreadyExistsInCart=true like the example above. */

    //Option 2
    // if the item is not found in the array existingItemInCart is undefined
    existingItemInCart = this.cartItems.find((item) => item.id === cartItem.id);

    itemAlreadyExistsInCart = existingItemInCart !== undefined;

    if (itemAlreadyExistsInCart) {
      existingItemInCart.qunatity++;
    } else {
      this.cartItems.push(cartItem);
    }

    this.computeCartTotals();
  }

  removeFromCart(cartItem: CartItem) {
    cartItem.qunatity--;

    if (cartItem.qunatity === 0) {
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let item of this.cartItems) {
      totalPriceValue += item.qunatity * item.unitPrice;
      totalQuantityValue += item.qunatity;
    }
    //publish the new values...all subscribers will recieve the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }

  //this method is not private because it is used in cart-details component
  // (in this case, we are removing one object from the array but with different value of quantity)

  remove(cartItem: CartItem) {
    //get index of item in the array
    const itemIndex: number = this.cartItems.findIndex(
      (item) => item.id === cartItem.id
    );
    //if found remove the item from the array at given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1); // remove 1 element, (1 is not index position)
      this.computeCartTotals();
    }
  }
}
