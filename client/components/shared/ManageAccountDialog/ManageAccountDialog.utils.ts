import * as z from "zod";

/**
 * @function formSchema
 * Zod validation schema for the manage account form.
 */
export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  institution: z.string().min(2, "Institution is required"),
  type: z.enum(["CASH", "SAVINGS", "INVESTMENT", "TRADING", "CRYPTO", "REAL_ESTATE"]),
  initialBalance: z.string().optional(),
});

export type ManageAccountFormValues = z.infer<typeof formSchema>;
