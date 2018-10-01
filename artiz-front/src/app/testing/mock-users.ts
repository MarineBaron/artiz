import User from '../models/user.model';

export const mockUsers: User[] = [
  new User().deserialize({
    id: 1,
    username: 'artiz',
    name: 'artiz',
    email: 'artiz@artiz.fr',
    role: 'admin'
  }),
  new User().deserialize({
    id: 2,
    username: 'art1',
    name: 'art1',
    email: 'art1@art1.fr',
    role: 'artisan',
    erpapikey: 'erpapikey1'
  }),
  new User().deserialize({
    id: 3,
    username: 'art2',
    name: 'art2',
    email: 'art2@art2.fr',
    role: 'artisan',
    erpapikey: 'erpapikey2'
  }),
];

