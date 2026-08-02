import {
  AdminRegisterRequest,
  User,
  UserRegisterRequest,
  UserRole,
} from '../../../models';

import {
  UserStore,
} from '../../../data/auth/users.mock';

class AuthApi {

  //--------------------------------------------------
  // Login
  //--------------------------------------------------

  async login(
    phoneNumber: string,
    password: string,
  ): Promise<User> {

    await new Promise<void>(resolve => {
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
      ...user
    } = found;

    return user as User;

  }

  //--------------------------------------------------
  // User Registration
  //--------------------------------------------------

  async registerUser(
    request: UserRegisterRequest,
  ): Promise<void> {

    await new Promise<void>(resolve => {
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

      id:
        Date.now().toString(),

      phoneNumber:
        request.phoneNumber,

      password:
        request.password,

      roNumber:
        request.roNumber,

      role:
        UserRole.USER,

      active:
        true,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

    });

  }

  //--------------------------------------------------
  // Admin Registration
  //--------------------------------------------------

  async registerAdmin(
    request: AdminRegisterRequest,
  ): Promise<void> {

    await new Promise<void>(resolve => {
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

      id:
        Date.now().toString(),

      name:
        request.name,

      phoneNumber:
        request.phoneNumber,

      password:
        request.password,

      role:
        UserRole.ADMIN,

      active:
        true,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

    });

  }

}

export default new AuthApi();