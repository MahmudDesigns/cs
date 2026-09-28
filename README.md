# Smart Student Accommodation Finder and Management System

A web-based platform that connects students, landlords, and administrators to simplify accommodation search, booking, and management for students in universities and colleges.

## The Problem

Students currently rely on notice boards, social media groups, referrals, and physical property visits to find housing — methods that are time-consuming, unreliable, and offer no real-time vacancy information. Fraudulent listings and scattered information make the search process worse.

Landlords, meanwhile, manage tenant records, rent payments, and maintenance requests largely on paper or in spreadsheets — leading to errors, lost information, and slow response times.

## What This System Does

- **Accommodation search** — students filter listings by location, price, room type, and amenities, with real-time vacancy status.
- **Online booking & reservation** — students reserve accommodation directly through the platform, with visible booking status.
- **Property & listing management** — landlords register properties, manage vacancies, and maintain tenant records.
- **Rent payment tracking** — records payments per tenant/booking and generates payment status reports.
- **Maintenance request management** — tenants submit requests; landlords respond and resolve them, creating a communication trail.
- **Administrative oversight** — admins manage users, verify listings before they go live (reducing fraud), monitor activity, and generate reports.

## User Roles

- **Student** — register, search/filter accommodation, view listings, book, track bookings, submit maintenance requests.
- **Landlord** — register properties, manage listings/vacancies/tenants, track rent payments, respond to maintenance requests, generate reports.
- **Administrator** — manage users, verify listings, monitor system activity, generate reports, handle disputes.

## Data Model (core entities)

Students, Landlords, Accommodation Listings, Bookings, Payments, Maintenance Requests — related so that a booking links a student to a listing, a payment links to a booking, and a maintenance request links a student to their accommodation.

## Non-Functional Requirements

- Secure authentication with role-based access control.
- Password encryption and protection of personal/payment data.
- Support for multiple concurrent users with reasonable response times.
- Mobile-responsive interface, since students are a primary user group.
- Designed to scale as listings and users grow.

## Scope

**Included:** accommodation search, booking, landlord property/tenant management, rent tracking, maintenance requests, admin oversight and reporting.

**Excluded:** legal tenancy dispute services, property ownership verification, and direct payment gateway integration (the system tracks/records payments but does not process financial transactions).

## Database

Data is stored in a MySQL database, covering Students, Landlords, Accommodation, Bookings, and Payments.

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd smart-student-accommodation

# Install dependencies
npm install

# Configure environment variables (database credentials, etc.)
cp .env.example .env

# Run database migrations
npx drizzle-kit push   # or your project's equivalent migration command

# Start the development server
npm run dev
```

## Project Status

Developed using an Agile methodology, in incremental phases: requirements analysis, system design, development, testing, and deployment/evaluation.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
