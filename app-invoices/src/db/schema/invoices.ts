import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const invoices = pgTable("invoices", {
  id: text().primaryKey(),
  customerId: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
