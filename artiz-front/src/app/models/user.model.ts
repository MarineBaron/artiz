import { Deserializable } from './deserializable.model';

export default class User implements Deserializable {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  erpapikey: string;
  erpId: number;
  isErpSync: boolean | null;

  public deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }
}
