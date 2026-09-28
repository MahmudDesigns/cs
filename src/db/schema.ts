import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ---------------------------------- enums ---------------------------------- */

export const userRoleEnum = pgEnum("user_role", ["student", "landlord", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const roomTypeEnum = pgEnum("room_type", [
  "single",
  "shared",
  "studio",
  "one_bedroom",
  "apartment",
]);
export const listingStatusEnum = pgEnum("listing_status", ["pending", "verified", "rejected"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "occupied",
  "completed",
  "cancelled",
  "rejected",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "pending", "overdue"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["open", "in_progress", "resolved"]);
export const maintenanceCategoryEnum = pgEnum("maintenance_category", [
  "plumbing",
  "electrical",
  "furniture",
  "internet",
  "security",
  "cleaning",
  "other",
]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "urgent"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "in_review", "resolved"]);

/* ---------------------------------- users ---------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    status: userStatusEnum("status").notNull().default("active"),
    phone: varchar("phone", { length: 40 }),
    university: varchar("university", { length: 160 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("users_role_idx").on(t.role)]
);

/* -------------------------------- properties ------------------------------- */

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull(),
    area: varchar("area", { length: 80 }).notNull(),
    address: varchar("address", { length: 200 }).notNull(),
    nearestCampus: varchar("nearest_campus", { length: 160 }).notNull(),
    distanceKm: varchar("distance_km", { length: 12 }).notNull().default("1.0"),
    roomType: roomTypeEnum("room_type").notNull(),
    pricePerMonth: integer("price_per_month").notNull(),
    deposit: integer("deposit").notNull().default(0),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    totalRooms: integer("total_rooms").notNull().default(1),
    availableRooms: integer("available_rooms").notNull().default(1),
    status: listingStatusEnum("status").notNull().default("pending"),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("properties_area_idx").on(t.area),
    index("properties_type_idx").on(t.roomType),
    index("properties_status_idx").on(t.status),
    index("properties_price_idx").on(t.pricePerMonth),
  ]
);

/* --------------------------------- bookings -------------------------------- */

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").notNull().default("pending"),
    moveInDate: date("move_in_date").notNull(),
    durationMonths: integer("duration_months").notNull().default(6),
    monthlyRent: integer("monthly_rent").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("bookings_reference_idx").on(t.reference),
    index("bookings_student_idx").on(t.studentId),
    index("bookings_property_idx").on(t.propertyId),
    index("bookings_status_idx").on(t.status),
  ]
);

/* --------------------------------- payments -------------------------------- */

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    period: varchar("period", { length: 40 }).notNull(),
    dueDate: date("due_date").notNull(),
    paidAt: timestamp("paid_at", { mode: "date" }),
    method: varchar("method", { length: 40 }),
    status: paymentStatusEnum("status").notNull().default("pending"),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("payments_reference_idx").on(t.reference),
    index("payments_booking_idx").on(t.bookingId),
    index("payments_status_idx").on(t.status),
    index("payments_landlord_idx").on(t.landlordId),
  ]
);

/* ------------------------------ maintenance -------------------------------- */

export const maintenanceRequests = pgTable(
  "maintenance_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    title: varchar("title", { length: 160 }).notNull(),
    details: text("details").notNull(),
    category: maintenanceCategoryEnum("category").notNull().default("other"),
    priority: priorityEnum("priority").notNull().default("medium"),
    status: maintenanceStatusEnum("status").notNull().default("open"),
    landlordNote: text("landlord_note"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("maintenance_reference_idx").on(t.reference),
    index("maintenance_property_idx").on(t.propertyId),
    index("maintenance_status_idx").on(t.status),
  ]
);

/* --------------------------------- disputes -------------------------------- */

export const disputes = pgTable(
  "disputes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull(),
    raisedById: uuid("raised_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 160 }).notNull(),
    details: text("details").notNull(),
    status: disputeStatusEnum("status").notNull().default("open"),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("disputes_reference_idx").on(t.reference)]
);

/* -------------------------------- relations -------------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
  payments: many(payments),
  maintenance: many(maintenanceRequests),
  disputes: many(disputes),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, { fields: [properties.landlordId], references: [users.id] }),
  bookings: many(bookings),
  maintenance: many(maintenanceRequests),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  student: one(users, { fields: [bookings.studentId], references: [users.id] }),
  property: one(properties, { fields: [bookings.propertyId], references: [properties.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
  student: one(users, { fields: [payments.studentId], references: [users.id] }),
  landlord: one(users, { fields: [payments.landlordId], references: [users.id] }),
}));

export const maintenanceRelations = relations(maintenanceRequests, ({ one }) => ({
  property: one(properties, { fields: [maintenanceRequests.propertyId], references: [properties.id] }),
  student: one(users, { fields: [maintenanceRequests.studentId], references: [users.id] }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  raisedBy: one(users, { fields: [disputes.raisedById], references: [users.id] }),
}));

/* ---------------------------------- types ---------------------------------- */

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
