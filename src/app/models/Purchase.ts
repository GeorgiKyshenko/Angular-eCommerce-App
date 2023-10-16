import { Address } from './Address';
import { Customer } from './Customer';
import { OrderDetails } from './OrderDetails';
import { OrderItem } from './Orderitem';

export class Purchase {
  constructor(
    public customer: Customer,
    public shippingAddress: Address,
    public billingAddress: Address,
    public orderDetails: OrderDetails,
    public orderItems: OrderItem[]
  ) {}
}
