export class OrderDetails {
  totalQuantity: number;
  totalPrice: number;

  constructor(totalQuantity: number, totalPrice: number) {
    this.totalQuantity = totalQuantity;
    this.totalPrice = totalPrice;
  }
}
