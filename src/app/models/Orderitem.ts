import { CartItem } from './CartItem';

export class OrderItem {
  public imageUrl: string;
  public unitPrice: number;
  public quantity: number;
  public productId: number;

  constructor(cartItem: CartItem) {
    this.imageUrl = cartItem.imageUrl;
    this.unitPrice = cartItem.unitPrice;
    this.quantity = cartItem.qunatity;
    this.productId = cartItem.id;
  }
}
