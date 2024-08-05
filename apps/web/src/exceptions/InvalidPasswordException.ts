import { ApplicationException } from "./ApplicationException.ts";

export class InvalidPasswordException extends ApplicationException {
  constructor() {
    super("Invalid password");
    this.name = "InvalidPasswordException";
  }
}
