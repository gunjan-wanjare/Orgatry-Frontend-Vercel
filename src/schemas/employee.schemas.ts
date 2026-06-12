import { z } from "zod";

export const employeeFormSchema = z.object({
  employeeId: z.string().trim().optional().transform(val => val === '' ? undefined : val),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().optional(),
  designation: z.string().trim().min(1, "Designation is required"),
  department: z.string().trim().min(1, "Department is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  workLocation: z.enum([
    "HYD",
    "LON",
    "SIN",
    "DUB",
    "REMOTE",
    "HYBRID",
    "WFH",
  ]).optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERN",
    "CONSULTANT",
  ]),
  status: z.enum(["ACTIVE", "INACTIVE", "ON_NOTICE", "TERMINATED"]),
  roleId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid().optional()),
  hrSpocId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid().optional()),
  reportingManagerId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid().optional()),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
