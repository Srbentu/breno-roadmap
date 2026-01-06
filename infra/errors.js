export class InternalServerError extends Error {
  constructor({ cause, statusCode } = {}) {
    super("Internal error happened", {
      cause,
    });
    this.name = "InternalServerError";
    this.action =
      "Please try again later or contact support if the issue persists.";
    this.statusCode = statusCode || 500;
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

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method Not Allowed for this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Verify the HTTP method used to access this endpoint.";
    this.statusCode = 405;
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
export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service not available ", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Verify if the service is running and accessible.";
    this.statusCode = 503;
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
