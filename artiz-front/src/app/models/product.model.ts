import { Deserializable } from './deserializable.model';

export  default class Product implements Deserializable {
  id: number;
  description: string;
  qty: number;
  price: number;
  tva_tx: number;
  projectId: number;
  erpId: number;

  deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }
}
