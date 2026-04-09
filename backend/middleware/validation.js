const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(60),
  email: z.string().email('Invalid email format').optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user', 'underwriting', 'mis']).optional(),
  department_id: z.number().optional(),
  branch_id: z.coerce.number().int().positive('Branch ID must be a positive number').optional(),
  branch_ids: z.array(z.coerce.number().int().positive()).optional()
});

const loginSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const ticketSchema = z.object({
  problem_type: z.enum(['it', 'underwriting', 'mis']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

const statusUpdateSchema = z.object({
  status: z.enum(['open', 'pending', 'approved', 'rejected', 'closed'])
});

const approvalSchema = z.object({
  remarks: z.string().optional()
});

const userStatusSchema = z.object({
  is_active: z.boolean()
});

const adminPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const branchAssignmentSchema = z.object({
  assignedBranchIds: z.array(z.coerce.number().int().positive()).default([])
});

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).max(60).optional(),
  email: z.string().email().optional().nullable(),
  role: z.enum(['admin', 'user', 'underwriting', 'mis']).optional(),
  department_id: z.coerce.number().optional().nullable(),
  branch_id: z.coerce.number().optional().nullable(),
  branch_ids: z.array(z.number().int().positive()).optional(),
  is_active: z.boolean().optional(),
  profile_image_url: z.string().url().optional().nullable()
});

const noticeSchema = z.object({
  heading: z.string().min(2, 'Heading must be at least 2 characters'),
  detail: z.string().min(1, 'Detail is required'),
  notice_date: z.string().min(1, 'Notice date is required'),
  notice_time: z.string().min(1, 'Notice time is required'),
  file_url: z.string().optional().nullable(),
  public_id: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  file_type: z.string().optional().nullable(),
  file_size: z.coerce.number().optional().nullable()
});

const popupSettingSchema = z.object({
  enabled: z.boolean()
});

const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  ticketSchema,
  statusUpdateSchema,
  approvalSchema,
  userStatusSchema,
  adminPasswordSchema,
  branchAssignmentSchema,
  userUpdateSchema,
  noticeSchema,
  popupSettingSchema,
  validate
};
