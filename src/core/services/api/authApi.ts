import {
  RegisterRequest,
  User,
  UserRole,
} from '../../../models';

import { UserStore } from '../../../data/auth/users.mock';

class AuthApi {

  async login(
    phoneNumber: string,
    password: string,
  ): Promise<User> {

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    const found =
      UserStore.findByCredentials(
        phoneNumber,
        password,
      );

    if (!found) {
      throw new Error(
        'Invalid phone number or password',
      );
    }

    const {
      password: _password,
      ...loggedUser
    } = found;

    return loggedUser as User;
  }

  async register(
    request: RegisterRequest,
  ): Promise<void> {

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    const existing =
      UserStore.findByPhone(
        request.phoneNumber,
      );

    if (existing) {
      throw new Error(
        'Phone number already registered.',
      );
    }

    UserStore.add({
      id: Date.now().toString(),

      name: request.name,

      phoneNumber:
        request.phoneNumber,

      password:
        request.password,

      roNumber:
        request.roNumber,

      role: request.role,

      active: true,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    });
  }
}

export default new AuthApi();