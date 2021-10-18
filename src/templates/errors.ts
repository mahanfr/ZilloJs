/**
 * Custom error when collecting template tokens
 * @class TemplateTokenError extends Error
 * @constructor
 * @param message Error Message
 */
export class TemplateTokenError extends Error {
  constructor(
    public message: string,
  ) {
    super(message);
    this.name = 'TemplateTokenError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TemplateTokenError.prototype);
  }

  /**
   * GetErrorTemplate:
   * Creates an Html page to show error information
   * @returns A Template created using the information that shows when in debug mode
   */
  public getErrorTemplate() {
    console.error('Not implemented yet');
  }
}

/**
 * Custom error when parsing template components
 * @class TemplateParsingError extends Error
 * @constructor
 * @param message Error Message
 */
export class TemplateParsingError extends Error {
  constructor(
    public message: string,
  ) {
    super(message);
    this.name = 'TemplateParsingError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TemplateParsingError.prototype);
  }

  /**
   * GetErrorTemplate:
   * Creates an Html page to show error information
   * @returns A Template created using the information that shows when in debug mode
   */
  public getErrorTemplate() {
    console.error('Not implemented yet');
  }
}

export class TemplateFileError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'TemplateFileError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, TemplateFileError.prototype);
  }

  /**
   * GetErrorTemplate:
   * Creates an Html page to show error information
   * @returns A Template created using the information that shows when in debug mode
   */
  public getErrorTemplate() {
    throw new Error('Not implemented yet');
  }
}
