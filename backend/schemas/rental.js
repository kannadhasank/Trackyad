import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

// Mirrors EMPTY_FORM in src/components/modals/NewRentalModal.jsx. Everything
// else on a rental (id, contract fields, sla) is derived server-side.
export const createRentalSchema = z
  .object({
    customerId: z.string().min(1),
    partnerId: z.string().min(1),
    partNumber: z.string().min(1),
    serialNumber: z.string().min(1),
    siteAddress: z.string().min(1),
    rentalStart: isoDate,
    endDate: isoDate,
    invoiceNumber: z.string().min(1),
    paymentStatus: z.enum(["paid", "pending", "overdue"]).default("pending"),
    status: z.enum(["active", "ending_soon", "overdue", "returned"]).default("active"),
    sla: z.string().optional(),
  })
  .refine((v) => v.endDate >= v.rentalStart, {
    message: "endDate must be on or after rentalStart",
    path: ["endDate"],
  });

export const updateRentalSchema = createRentalSchema.innerType().partial();

export const rentalQuerySchema = z.object({
  status: z.enum(["all", "active", "ending_soon", "overdue", "returned"]).optional(),
  q: z.string().trim().optional(),
});
