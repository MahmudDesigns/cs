import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/db/index";
import {
  users,
  properties,
  bookings,
  payments,
  maintenanceRequests,
  disputes,
} from "../src/db/schema";
import { IMG } from "../src/lib/constants";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const days = (n: number) => new Date(Date.now() + n * 86400000);
const period = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(d);
const ref = (p: string) =>
  `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^A-Z0-9]/g, "X")}`;

async function main() {
  console.log("Clearing existing data…");
  await db.delete(disputes);
  await db.delete(maintenanceRequests);
  await db.delete(payments);
  await db.delete(bookings);
  await db.delete(properties);
  await db.delete(users);

  console.log("Creating users…");
  const adminHash = bcrypt.hashSync("admin123", 10);
  const landlordHash = bcrypt.hashSync("landlord123", 10);
  const studentHash = bcrypt.hashSync("student123", 10);

  const [admin, l1, l2, l3, s1, s2, s3, s4, s5, s6] = await db
    .insert(users)
    .values([
      { name: "System Administrator", email: "admin@campusstay.app", passwordHash: adminHash, role: "admin", phone: "+254 700 000 001" },
      { name: "Margaret Wanjiru", email: "landlord@campusstay.app", passwordHash: landlordHash, role: "landlord", phone: "+254 722 114 908" },
      { name: "Peter Omondi", email: "peter@campusstay.app", passwordHash: landlordHash, role: "landlord", phone: "+254 733 501 226" },
      { name: "Susan Karanja", email: "susan@campusstay.app", passwordHash: landlordHash, role: "landlord", phone: "+254 711 883 447" },
      { name: "Amina Yusuf", email: "student@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 745 220 113", university: "Greenfield University" },
      { name: "Brian Kiprop", email: "brian@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 759 041 765", university: "Northgate Tech" },
      { name: "Chloe Mensah", email: "chloe@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 701 997 304", university: "City College" },
      { name: "David Otieno", email: "david@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 788 530 219", university: "Greenfield University" },
      { name: "Grace Njeri", email: "grace@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 798 402 661", university: "St. Anne's College" },
      { name: "Samuel Adeyemi", email: "samuel@campusstay.app", passwordHash: studentHash, role: "student", phone: "+254 706 118 930", university: "Northgate Tech" },
    ])
    .returning();

  console.log("Creating properties…");
  const [p1, p2, p3, p4, p5, p6, p7, p8, p9] = await db
    .insert(properties)
    .values([
      {
        landlordId: l1.id,
        title: "Sunrise Court — bright singles next to Greenfield",
        description:
          "Twelve self-contained single rooms in a gated compound five minutes' walk from the Greenfield main gate. Every room has a study desk and wardrobe; rent includes water, unlimited Wi-Fi and weekly cleaning of shared areas. Backup generator keeps the lights on during outages.",
        area: "Campus Gate",
        address: "12 Acacia Lane",
        nearestCampus: "Greenfield University",
        distanceKm: "0.4",
        roomType: "single",
        pricePerMonth: 140,
        deposit: 140,
        amenities: ["Wi-Fi", "Study desk", "Water 24/7", "Backup power", "Security & CCTV", "Furnished"],
        images: [IMG.bedrooms[0], IMG.bedrooms[3], IMG.exteriors[0]],
        totalRooms: 12,
        availableRooms: 3,
        status: "verified",
        featured: true,
        createdAt: days(-40),
      },
      {
        landlordId: l1.id,
        title: "The Scholar's Den — private studios with kitchenettes",
        description:
          "Six modern studio units designed for focused living: kitchenette, hot shower, dedicated work corner and fast fibre internet. Quiet hours after 10pm make it a favourite with postgraduate students at Northgate Tech.",
        area: "Northgate",
        address: "4 Marula Close",
        nearestCampus: "Northgate Tech",
        distanceKm: "0.6",
        roomType: "studio",
        pricePerMonth: 260,
        deposit: 260,
        amenities: ["Wi-Fi", "Private kitchen", "Hot shower", "Study desk", "Security & CCTV", "Laundry"],
        images: [IMG.bedrooms[6], IMG.bedrooms[1], IMG.shared[0]],
        totalRooms: 6,
        availableRooms: 1,
        status: "verified",
        featured: true,
        createdAt: days(-35),
      },
      {
        landlordId: l2.id,
        title: "Riverside Studios — calm rooms by the water",
        description:
          "Eight airy studios overlooking the river walk, each with a private balcony. Rent covers Wi-Fi, water and access to the shared kitchen garden. A straight 10-minute cycle to City College along the river path.",
        area: "Riverside",
        address: "27 Riverbend Road",
        nearestCampus: "City College",
        distanceKm: "1.8",
        roomType: "studio",
        pricePerMonth: 210,
        deposit: 200,
        amenities: ["Wi-Fi", "Water 24/7", "Shared kitchen", "Hot shower", "Parking", "Laundry"],
        images: [IMG.bedrooms[4], IMG.bedrooms[7], IMG.exteriors[3]],
        totalRooms: 8,
        availableRooms: 2,
        status: "verified",
        createdAt: days(-28),
      },
      {
        landlordId: l2.id,
        title: "Hillview Annexe — friendly shared rooms, unbeatable price",
        description:
          "Two-bed shared rooms in our family-run annexe. Ideal for first-years: big shared kitchen, laundry room and a study lounge that's open till midnight. Security guard on site and visitors' register at the gate.",
        area: "Hillview",
        address: "9 Summit View",
        nearestCampus: "St. Anne's College",
        distanceKm: "1.2",
        roomType: "shared",
        pricePerMonth: 110,
        deposit: 100,
        amenities: ["Wi-Fi", "Shared kitchen", "Laundry", "Security & CCTV", "Backup power", "Furnished"],
        images: [IMG.bedrooms[5], IMG.shared[1], IMG.exteriors[2]],
        totalRooms: 10,
        availableRooms: 4,
        status: "verified",
        createdAt: days(-22),
      },
      {
        landlordId: l2.id,
        title: "Old Town Suites — character one-bedrooms (currently full)",
        description:
          "Four spacious one-bedroom units in a restored Old Town building — tall ceilings, hardwood floors and thick walls that keep things quiet. Fully occupied this semester; new vacancies are posted the moment a tenancy ends.",
        area: "Old Town",
        address: "3 Cobble Court",
        nearestCampus: "City College",
        distanceKm: "2.1",
        roomType: "one_bedroom",
        pricePerMonth: 320,
        deposit: 320,
        amenities: ["Wi-Fi", "Private kitchen", "Furnished", "Hot shower", "Water 24/7"],
        images: [IMG.bedrooms[8], IMG.bedrooms[2], IMG.exteriors[4]],
        totalRooms: 4,
        availableRooms: 0,
        status: "verified",
        createdAt: days(-30),
      },
      {
        landlordId: l3.id,
        title: "Gardenia Lofts — whole apartment for a group of friends",
        description:
          "A three-bedroom top-floor apartment in Gardenia, perfect for a group renting together. Open-plan living room, two bathrooms and a rooftop terrace. Fibre internet and gym membership at the estate gym included.",
        area: "Gardenia",
        address: "18 Bougainvillea Drive",
        nearestCampus: "Greenfield University",
        distanceKm: "3.0",
        roomType: "apartment",
        pricePerMonth: 450,
        deposit: 450,
        amenities: ["Wi-Fi", "Private kitchen", "Gym access", "Hot shower", "Parking", "Backup power", "Furnished"],
        images: [IMG.shared[3], IMG.shared[2], IMG.bedrooms[9], IMG.exteriors[1]],
        totalRooms: 3,
        availableRooms: 1,
        status: "verified",
        createdAt: days(-18),
      },
      {
        landlordId: l1.id,
        title: "Campus Gate Bedsitters — budget singles, zero commute",
        description:
          "Sixteen compact bedsitters directly opposite the Greenfield side gate — roll out of bed and into lectures. Simple, clean and secure; each unit fits a bed, desk and small kitchenette counter.",
        area: "Campus Gate",
        address: "2 University Way",
        nearestCampus: "Greenfield University",
        distanceKm: "0.2",
        roomType: "single",
        pricePerMonth: 95,
        deposit: 95,
        amenities: ["Wi-Fi", "Water 24/7", "Security & CCTV", "Study desk"],
        images: [IMG.bedrooms[2], IMG.bedrooms[9], IMG.exteriors[2]],
        totalRooms: 16,
        availableRooms: 5,
        status: "verified",
        createdAt: days(-12),
      },
      {
        landlordId: l2.id,
        title: "Palm Grove Hostel — social shared living (2-3 per room)",
        description:
          "A lively hostel-style property a short walk from Northgate Tech. Shared rooms of two or three, big common room with games, and a courtyard for weekend barbecues. All bills included in the price shown.",
        area: "Northgate",
        address: "7 Palm Grove",
        nearestCampus: "Northgate Tech",
        distanceKm: "0.9",
        roomType: "shared",
        pricePerMonth: 85,
        deposit: 85,
        amenities: ["Wi-Fi", "Shared kitchen", "Laundry", "Security & CCTV", "Water 24/7"],
        images: [IMG.bedrooms[1], IMG.shared[1], IMG.exteriors[2]],
        totalRooms: 20,
        availableRooms: 6,
        status: "pending",
        createdAt: days(-2),
      },
      {
        landlordId: l3.id,
        title: "Ivy House Apartments — quiet one-bedrooms for final years",
        description:
          "Five well-kept one-bedroom apartments for students who want their own space. Ivy-covered balconies, dedicated parking and a very strict no-parties policy. Ten-minute walk to City College library.",
        area: "Riverside",
        address: "21 Ivy Terrace",
        nearestCampus: "City College",
        distanceKm: "2.4",
        roomType: "one_bedroom",
        pricePerMonth: 380,
        deposit: 380,
        amenities: ["Wi-Fi", "Private kitchen", "Parking", "Hot shower", "Backup power", "Furnished"],
        images: [IMG.bedrooms[7], IMG.bedrooms[6], IMG.exteriors[4]],
        totalRooms: 5,
        availableRooms: 2,
        status: "pending",
        createdAt: days(-1),
      },
    ])
    .returning();

  console.log("Creating bookings…");
  const [b1, b2, b3, b4, b5, b6, b7, b8, b9, b10] = await db
    .insert(bookings)
    .values([
      { reference: ref("BK"), studentId: s1.id, propertyId: p1.id, status: "occupied", moveInDate: iso(days(-52)), durationMonths: 6, monthlyRent: 140, createdAt: days(-55) },
      { reference: ref("BK"), studentId: s2.id, propertyId: p1.id, status: "confirmed", moveInDate: iso(days(14)), durationMonths: 6, monthlyRent: 140, createdAt: days(-6) },
      { reference: ref("BK"), studentId: s3.id, propertyId: p2.id, status: "occupied", moveInDate: iso(days(-40)), durationMonths: 9, monthlyRent: 260, createdAt: days(-44) },
      { reference: ref("BK"), studentId: s4.id, propertyId: p4.id, status: "confirmed", moveInDate: iso(days(9)), durationMonths: 6, monthlyRent: 110, createdAt: days(-4) },
      { reference: ref("BK"), studentId: s5.id, propertyId: p3.id, status: "pending", moveInDate: iso(days(21)), durationMonths: 6, monthlyRent: 210, createdAt: days(-1) },
      { reference: ref("BK"), studentId: s1.id, propertyId: p7.id, status: "completed", moveInDate: iso(days(-200)), durationMonths: 6, monthlyRent: 95, createdAt: days(-203) },
      { reference: ref("BK"), studentId: s6.id, propertyId: p5.id, status: "pending", moveInDate: iso(days(30)), durationMonths: 12, monthlyRent: 320, createdAt: days(-1) },
      { reference: ref("BK"), studentId: s2.id, propertyId: p3.id, status: "cancelled", moveInDate: iso(days(-10)), durationMonths: 6, monthlyRent: 210, createdAt: days(-16) },
      { reference: ref("BK"), studentId: s4.id, propertyId: p7.id, status: "occupied", moveInDate: iso(days(-75)), durationMonths: 6, monthlyRent: 95, createdAt: days(-78) },
      { reference: ref("BK"), studentId: s3.id, propertyId: p6.id, status: "rejected", moveInDate: iso(days(-20)), durationMonths: 12, monthlyRent: 450, createdAt: days(-24) },
    ])
    .returning();

  console.log("Creating payments…");
  await db.insert(payments).values([
    // b1 — occupied tenant (Amina), two paid + one upcoming
    { reference: ref("PM"), bookingId: b1.id, studentId: s1.id, landlordId: l1.id, amount: 140, period: period(days(-50)), dueDate: iso(days(-48)), paidAt: days(-49), method: "Mobile money", status: "paid", createdAt: days(-50) },
    { reference: ref("PM"), bookingId: b1.id, studentId: s1.id, landlordId: l1.id, amount: 140, period: period(days(-20)), dueDate: iso(days(-18)), paidAt: days(-19), method: "Bank transfer", status: "paid", createdAt: days(-20) },
    { reference: ref("PM"), bookingId: b1.id, studentId: s1.id, landlordId: l1.id, amount: 140, period: period(days(10)), dueDate: iso(days(5)), status: "pending", createdAt: days(-2) },
    // b3 — occupied tenant (Chloe): one paid, one overdue
    { reference: ref("PM"), bookingId: b3.id, studentId: s3.id, landlordId: l1.id, amount: 260, period: period(days(-38)), dueDate: iso(days(-36)), paidAt: days(-37), method: "Card", status: "paid", createdAt: days(-38) },
    { reference: ref("PM"), bookingId: b3.id, studentId: s3.id, landlordId: l1.id, amount: 260, period: period(days(-8)), dueDate: iso(days(-10)), status: "pending", createdAt: days(-9) },
    // b4 — confirmed tenant (David): first charge pending soon
    { reference: ref("PM"), bookingId: b4.id, studentId: s4.id, landlordId: l2.id, amount: 110, period: period(days(9)), dueDate: iso(days(3)), status: "pending", createdAt: days(-1) },
    // b9 — occupied tenant (David p7): paid + overdue
    { reference: ref("PM"), bookingId: b9.id, studentId: s4.id, landlordId: l1.id, amount: 95, period: period(days(-70)), dueDate: iso(days(-68)), paidAt: days(-69), method: "Cash", status: "paid", createdAt: days(-70) },
    { reference: ref("PM"), bookingId: b9.id, studentId: s4.id, landlordId: l1.id, amount: 95, period: period(days(-4)), dueDate: iso(days(-2)), status: "pending", createdAt: days(-5) },
    // b2 — confirmed (Brian): upcoming first month
    { reference: ref("PM"), bookingId: b2.id, studentId: s2.id, landlordId: l1.id, amount: 140, period: period(days(14)), dueDate: iso(days(12)), status: "pending", createdAt: days(-1) },
    // b6 — completed tenancy history: two old paid
    { reference: ref("PM"), bookingId: b6.id, studentId: s1.id, landlordId: l1.id, amount: 95, period: period(days(-198)), dueDate: iso(days(-196)), paidAt: days(-197), method: "Mobile money", status: "paid", createdAt: days(-198) },
    { reference: ref("PM"), bookingId: b6.id, studentId: s1.id, landlordId: l1.id, amount: 95, period: period(days(-168)), dueDate: iso(days(-166)), paidAt: days(-170), method: "Mobile money", status: "paid", createdAt: days(-168) },
  ]);

  console.log("Creating maintenance requests…");
  await db.insert(maintenanceRequests).values([
    { reference: ref("MR"), propertyId: p1.id, studentId: s1.id, bookingId: b1.id, title: "Kitchen tap is leaking badly", details: "The tap in the shared kitchen leaks constantly — there's a steady drip even when closed and the cabinet underneath is swollen. Started two days ago.", category: "plumbing", priority: "urgent", status: "open", createdAt: days(-1), updatedAt: days(-1) },
    { reference: ref("MR"), propertyId: p2.id, studentId: s3.id, bookingId: b3.id, title: "Wi-Fi drops every evening", details: "The fibre connection drops between 7pm and 10pm almost every day. Streaming lectures is impossible in the evening — could the router or plan be upgraded?", category: "internet", priority: "medium", status: "in_progress", landlordNote: "Called the ISP — a technician visits on Thursday. Temporary 5G router placed in the hallway.", createdAt: days(-3), updatedAt: days(-1) },
    { reference: ref("MR"), propertyId: p7.id, studentId: s4.id, bookingId: b9.id, title: "Wardrobe hinge broken", details: "The left door of my wardrobe came off its hinge. Screws are stripped — needs a small repair or replacement.", category: "furniture", priority: "low", status: "resolved", landlordNote: "Fixed by the caretaker on Saturday — new hinges fitted and door aligned.", createdAt: days(-12), updatedAt: days(-9) },
    { reference: ref("MR"), propertyId: p1.id, studentId: s1.id, bookingId: b1.id, title: "Corridor bulb flickers at night", details: "The bulb outside room 4 flickers and sometimes dies completely at night. A bit unsettling when coming back late.", category: "electrical", priority: "medium", status: "in_progress", landlordNote: "New LED tubes ordered — will be installed this week.", createdAt: days(-4), updatedAt: days(-2) },
    { reference: ref("MR"), propertyId: p4.id, studentId: s4.id, bookingId: b4.id, title: "Gate remote battery dead", details: "The main gate remote for my unit stopped working. Manually opening is fine but in the rain it's a hassle.", category: "security", priority: "low", status: "open", createdAt: days(-2), updatedAt: days(-2) },
  ]);

  console.log("Creating disputes…");
  await db.insert(disputes).values([
    { reference: ref("DP"), raisedById: s5.id, subject: "Listing photos don't match the actual room", details: "I viewed a unit at Riverside Studios yesterday and the room looked nothing like the photos — different furniture, damp on one wall. Booking BK reference pending. Please review the listing.", status: "open", createdAt: days(-1), updatedAt: days(-1) },
    { reference: ref("DP"), raisedById: l1.id, subject: "Deposit dispute with outgoing tenant", details: "A completed tenancy ended with a damaged desk and missing keys. Tenant is disputing the $60 deduction from their deposit. Payment refs on record — would like admin to mediate.", status: "in_review", adminNote: "Reviewing the inventory checklist and charge history with both parties. Decision expected this week.", createdAt: days(-6), updatedAt: days(-2) },
    { reference: ref("DP"), raisedById: s2.id, subject: "I was charged twice for the same month", details: "Two identical charges appeared for the same period on my booking. One has been settled; requesting removal of the duplicate.", status: "resolved", adminNote: "Confirmed a duplicate charge — removed from the ledger and both parties notified. Resolved.", createdAt: days(-20), updatedAt: days(-15) },
  ]);

  console.log("Seed complete.");
  console.log("  admin@campusstay.app / admin123");
  console.log("  landlord@campusstay.app / landlord123");
  console.log("  student@campusstay.app / student123");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
