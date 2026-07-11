const { z } = require('zod');

const contactSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    enquiry_type: z.string().max(50).optional(),
    message: z.string().max(1000).optional().nullable(),
    enquiry_message: z.string().max(1000).optional().nullable(),
    travel_date: z.string().optional().nullable(),
    travelers: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().int().positive().optional()),
    package_id: z.preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().int().positive().optional())
});

const newsletterSchema = z.object({
    email: z.string().email("Invalid email address")
});

const adminLoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

module.exports = {
    contactSchema,
    newsletterSchema,
    adminLoginSchema
};
