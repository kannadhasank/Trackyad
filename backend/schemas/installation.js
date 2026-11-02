import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const time = z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM");

// Optional time fields arrive as "" from an untouched <input type="time">.
const optionalTime = z.union([time, z.literal("")]).optional().transform((v) => v || null);
const optionalText = z.string().optional().transform((v) => v?.trim() || null);

export const createInstallationSchema = z
  .object({
    customerId: z.string().min(1),
    installationAddress: z.string().min(1),
    installationDate: isoDate,
    installationTime: optionalTime,
    deviceModel: z.string().min(1),
    serialNumber: z.string().min(1),
    startTime: optionalTime,
    endTime: optionalTime,
    location: z.enum(["Local", "Overseas"]).default("Local"),
    country: optionalText,
    assignedEngineer: optionalText,
    quotationNumber: optionalText,
    poNumber: optionalText,
  })
  .refine((v) => !v.startTime || !v.endTime || v.endTime >= v.startTime, {
    message: "endTime must be at or after startTime",
    path: ["endTime"],
  });

export const updateInstallationSchema = createInstallationSchema.innerType().partial();
