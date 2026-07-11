const { ZodError } = require('zod');

/**
 * Middleware to validate request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} source - The request property to validate (default: 'body').
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Parse and validate the data. 
            // .parse() throws a ZodError if validation fails.
            const validatedData = schema.parse(req[source]);
            
            // Replace req data with parsed data (e.g. string "1" becomes number 1 if schema defines it)
            req[source] = validatedData;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors into a cleaner response
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formattedErrors
                });
            }
            
            // Pass unhandled errors to the global error handler
            next(error);
        }
    };
};

module.exports = { validate };
