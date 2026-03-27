/**
 * Generic validator interface.
 * ISP: callers depend only on what they need (validate).
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IValidator<T> {
  validate(target: T): ValidationResult;
}
