# LedgeFice Voucher & Approval Management SaaS

A multi-tenant SaaS platform that replaces paper vouchers and WhatsApp approval chains with a configurable digital voucher request and approval management system for African businesses.

## About the Project

LedgeFice  allows any organisation  construction companies, hospitals, schools, NGOs, logistics firms  to sign up and configure their own voucher types, roles, approval chains, and amount thresholds. Staff raise digital voucher requests, the system routes them automatically to the correct approvers based on amount, every action is permanently recorded in an audit log, and management gets real-time spend visibility across all departments.

## Live Demo

🔗 https://ledgefice.vercel.app

Use the credentials below to explore the platform without signing up:

**Org Admin** (full configuration access — roles, voucher types, approval chains, staff management)
Email: aulexc4d2@gmail.com
Password: 12345678



Or create your own organisation by clicking "Sign Up" and walking through the onboarding wizard.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TanStack Query
- **Styling:** Tailwind CSS
- **Backend:** Go + Fiber + GORM
- **Database:** PostgreSQL
- **Auth:** JWT
- **Email:** Resend API
- **Payments:** Nomba API (checkout, card tokenization, direct debit mandate)

## Key Features

- Multi-tenant architecture with complete org isolation
- Dynamic voucher type builder with custom fields (EAV pattern)
- Configurable approval chains by voucher type and amount tier
- Permission-based role system with 7 runtime-gated flags
- Automatic duplicate detection against 12-month history
- Immutable audit log on every action
- Email notifications at every approval step
- Management dashboard with spend analytics
- Subscription billing with card tokenization and direct debit mandate via Nomba API

## Related Repositories

- Frontend: https://github.com/au-lex/Ledgefice_FE
- Backend: https://github.com/au-lex/Ledgefice_BE
