export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Internal error happened", {
      cause,
    });
    this.name = "InternalServerError";
    this.action =
      "Please try again later or contact support if the issue persists.";
    this.statusCode = 500;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
