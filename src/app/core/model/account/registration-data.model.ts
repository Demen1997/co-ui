import {Credentials} from './credentials.model';

export class RegistrationData extends Credentials {
  email: string;

  validate(): boolean {
    return super.validate() && !!this.email;
  }
}
