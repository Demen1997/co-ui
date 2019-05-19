export class Credentials {
  username: string;
  password: string;

  validate(): boolean {
    return !!this.username && !!this.password;
  }
}
