import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export interface RequestValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateRequest(schemas: RequestValidationSchemas | ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ('parseAsync' in schemas || 'parse' in schemas) {
        req.body = await (schemas as ZodSchema).parseAsync(req.body);
      } else {
        if (schemas.body) {
          req.body = await schemas.body.parseAsync(req.body);
        }
        if (schemas.query) {
          req.query = (await schemas.query.parseAsync(req.query)) as any;
        }
        if (schemas.params) {
          req.params = (await schemas.params.parseAsync(req.params)) as any;
        }
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((e: ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const firstMessage = issues[0]?.message || 'Validation Error';
        return res.status(400).json({
          error: firstMessage,
          details: issues,
        });
      }
      return next(error);
    }
  };
}
