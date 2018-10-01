import { Deserializable } from './deserializable.model';
import User from './user.model';
import Product from './product.model';

export default class Project implements Deserializable {
  id: number;
  name: string;
  artisan: User;
  client: User;
  erpId: number;
  isErpSync: boolean | null;
  products: Product[];

  deserialize(input: any): this {
    Object.assign(this, input);
    this.artisan = new User().deserialize(input.artisan);
    this.client = new User().deserialize(input.artisan);
    this.products = input.products.map((p) => new Product().deserialize(p));
    return this;
  }
}
