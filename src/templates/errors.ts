/**
 * Custom error when collecting template tokens
 * @class TemplateTokenError extends Error
 * @constructor
 * @param message Error Message
 * @param file File that caused the error
 * @param line Line that caused the error
 * @param col Column that caused the error
 */
class TemplateTokenError extends Error {
  constructor(
    public message: string,
    public file?: string,
    public line?: number,
    public col?: number,
  ) {
    super(`(${file}:${line}:${col}): ${message}`);
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
 * @param file File that caused the error
 * @param line Line that caused the error
 * @param col Column that caused the error
 */
class TemplateParsingError extends Error {
  constructor(
    public message: string,
    public file?: string,
    public line?: number,
    public col?: number,
  ) {
    super(`(${file}:${line}:${col}): ${message}`);
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
