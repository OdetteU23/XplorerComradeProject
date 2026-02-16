export default class CustomError extends Error {
  status = 400; // Default status code, can/should be overridden

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

