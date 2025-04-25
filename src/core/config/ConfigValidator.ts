import { validateSync, ValidationError } from 'class-validator';

export const configValidation = {
  validateConfig: (config: any) => {
    const errors: ValidationError[] = validateSync(config);
    if (errors.length > 0) {
      const sortedMessages: string = errors
        .map((error: ValidationError) =>
          Object.values(error.constraints || {}).join(', '),
        )
        .join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  },
  getEnumValues: (environments: Object) => {
    return Object.values(environments);
  },
};
