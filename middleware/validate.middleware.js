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
            if (error && (error instanceof ZodError || Array.isArray(error.errors))) {
                const errList = Array.isArray(error.errors) ? error.errors : [];
                const formattedErrors = errList.map(err => ({
                    field: Array.isArray(err.path) ? err.path.join('.') : (err.path || 'field'),
                    message: err.message || 'Invalid input value'
                }));

                return res.status(400).json({
                    success: false,
                    message: error.message || 'Validation failed',
                    errors: formattedErrors
                });
            }
            
            // Pass unhandled errors to the global error handler
            next(error);
        }
    };
};

module.exports = { validate };
