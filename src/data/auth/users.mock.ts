import {
  User,
  UserRole,
} from '../../models';

const now = new Date().toISOString();

const users: User[] = [
  {
    id: '1',
    name: 'Admin',
    phoneNumber: '9999999999',
    password: '123456',
    role: UserRole.ADMIN,
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '2',
    name: 'Rahul Kumar',
    phoneNumber: '8888888888',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1001',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '3',
    name: 'Priya Sharma',
    phoneNumber: '8888888881',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1002',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '4',
    name: 'Amit Singh',
    phoneNumber: '8888888882',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1003',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '5',
    name: 'Sneha Patel',
    phoneNumber: '8888888883',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1004',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '6',
    name: 'Vikram Reddy',
    phoneNumber: '8888888884',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1005',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '7',
    name: 'Anjali Verma',
    phoneNumber: '8888888885',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1010',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '8',
    name: 'Karan Mehta',
    phoneNumber: '8888888886',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1025',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '9',
    name: 'Neha Gupta',
    phoneNumber: '8888888887',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1050',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '10',
    name: 'Rohit Joshi',
    phoneNumber: '8888888889',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1100',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '11',
    name: 'Pooja Nair',
    phoneNumber: '8888888890',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1200',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '12',
    name: 'Suresh Iyer',
    phoneNumber: '8888888891',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO1500',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '13',
    name: 'Deepak Yadav',
    phoneNumber: '8888888892',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO2001',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '14',
    name: 'Meera Thomas',
    phoneNumber: '8888888893',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO2500',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '15',
    name: 'Arjun Das',
    phoneNumber: '8888888894',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO3000',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '16',
    name: 'Kavya Rao',
    phoneNumber: '8888888895',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO4000',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '17',
    name: 'Nitin Agarwal',
    phoneNumber: '8888888896',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO5000',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '18',
    name: 'Harish Babu',
    phoneNumber: '8888888897',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO7777',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '19',
    name: 'Lakshmi Devi',
    phoneNumber: '8888888898',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO8888',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '20',
    name: 'Manoj Pillai',
    phoneNumber: '8888888899',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO9999',
    active: true,
    createdAt: now,
    updatedAt: now,
  },

  {
    id: '21',
    name: 'Bhagat Brothers',
    phoneNumber: '8000000001',
    password: '123456',
    role: UserRole.USER,
    roNumber: 'RO8001',
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const UserStore = {

  getAll() {
    return users;
  },

  add(user: User) {
    users.push(user);
  },

  findByPhone(
    phone: string,
  ) {
    return users.find(
      x =>
        x.phoneNumber === phone,
    );
  },

  findByCredentials(
    phone: string,
    password: string,
  ) {
    return users.find(
      x =>
        x.phoneNumber === phone &&
        x.password === password,
    );
  },

  findByRoNumber(
    roNumber: string,
  ) {
    return users.find(
      x =>
        x.roNumber === roNumber,
    );
  },

};