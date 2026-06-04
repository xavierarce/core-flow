import * as z from "zod";

export const formSchema = z.object({
  description: z.string().min(2, "Description is too short"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
      message: "Amount must be a valid number",
    }),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional(),
  date: z.string(),
  isRecurring: z.boolean(),
});

export type AddTransactionFormValues = z.infer<typeof formSchema>;
