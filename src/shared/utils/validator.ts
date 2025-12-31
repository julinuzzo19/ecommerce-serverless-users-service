import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validateDto = async <T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> => {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors = await validate(dtoInstance);

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();

    throw {
      statusCode: 400,
      message: messages.join(', '),
    };
  }

  return dtoInstance;
};