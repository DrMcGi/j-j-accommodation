# J & J Grootboom Farm Accommodation

## Online booking system guide

**Document date:** 13 November 2026

**Audience:** J & J management and accommodation guests

**Status:** Describes the intended automated booking service. The booking automation has been implemented in the project, but the new database migration and payment, email, domain, and property-policy setup must be completed and tested before it can be used for live reservations.

## What the system is designed to do

The online system is designed to let a guest complete a reservation without waiting for staff to check dates, choose a room, calculate the amount, prepare an agreement, or request payment. It checks the shared room inventory, assigns a physical unit, prepares the guest's agreement and invoice, takes payment through Ozow, and confirms the reservation after Ozow reports a successful payment through its signed notification.

J & J staff then use the administration calendar to see confirmed stays, upcoming arrivals, payments, and room assignments. At reception, staff check the guest's booking reference and confirmed status, then hand over the keys. The website does not control door locks or issue digital room keys.

## Accommodation and availability

The inventory is set up for **9 bachelor units** and **4 two-bedroom units**. Both accommodation types can be booked overnight or monthly, and both booking types use the same physical rooms. A room reserved for either stay type is unavailable to other guests for overlapping dates.

The guest chooses:

- Bachelor or two-bedroom accommodation.
- Overnight or monthly stay.
- Arrival and departure dates.
- Number of guests.

The availability calendar reports how many units of the selected type are available on each selected date. For example, if one bachelor unit is already reserved on every selected date, the page should show 8 of 9 bachelor units available. If no unit is free for any date in the requested range, the guest cannot place that reservation for those dates.

When the guest reserves, the server checks the dates again and assigns one available physical unit. This second check protects the last available room from being allocated to two simultaneous bookings. Maintenance or owner-use blocks also reduce the available count.

The departure date is not an occupied night. The booking covers the selected interval from arrival up to, but not including, departure. Once a stay has passed its departure date, it no longer reduces availability for future dates. Unpaid room holds last 20 minutes; after they expire, the room can be offered again.

## How prices are calculated

The current configured pricing rules are:

| Accommodation | Overnight | Monthly |
| --- | ---: | ---: |
| Bachelor (one bed) | R850 per night | R7,500 per started month |
| Two-bedroom (two beds) | R1,700 per night | R13,500 per started month |

Overnight pricing is per bed, so a two-bedroom booking costs twice the R850 bed rate for each night. Monthly pricing uses the selected accommodation's monthly rate. Each started monthly period is charged as a full month: if a guest stays beyond a complete month by even part of another month, the next full monthly rate applies. The exact dates selected by the guest are the dates blocked in the calendar.

The total is calculated and shown before payment. The property policy also sets occupancy limits, deposits, and cancellation/refund wording. J & J must approve those terms in the one-time booking setup before the system can accept automatic reservations.

## Guest booking journey

1. **Create an account and confirm the email address.** The guest signs up with an email and password, then follows the confirmation link sent to that email.
2. **Choose accommodation and dates.** The guest selects the room type, stay type, arrival and departure dates, number of guests, and provides a contact phone number. An optional note can be included for practical stay information.
3. **Check availability.** The system shows available units for each date in the range.
4. **Reserve a room.** If a unit is available and online booking is enabled, the system rechecks inventory, assigns a physical room, calculates the price, creates the booking and invoice, prepares the agreement, and holds the room for 20 minutes.
5. **Review and sign the agreement.** The guest opens the agreement in their account, reads it, types their full legal name, and checks the acceptance box. The system stores the signature evidence against that exact agreement version.
6. **Pay online.** The guest continues to Ozow's hosted payment page and completes payment there.
7. **Receive confirmation.** The app waits for Ozow's signed payment notification. A successful notification marks the booking confirmed, creates a paid receipt, and queues email notifications. A browser redirect alone is not treated as proof of payment.
8. **Arrive and collect keys.** The guest presents the booking reference or account confirmation. Reception checks that the booking is confirmed and hands over the keys.

The room hold is temporary, not the final booking confirmation. If the guest does not complete the agreement and payment before the 20-minute hold expires, the room may become available to another guest.

## Accommodation agreement and signing

J & J completes the agreement policy once in the administration area. That setup includes the legal lessor name, occupancy limits, deposit amount and handling, cancellation and refund terms, any additional terms, and the authorized management signer's name.

For each reservation, the system creates a booking-specific agreement containing the guest and booking details, assigned room, dates, amount, occupancy, deposit and cancellation terms, and accommodation rules. The management authorization for the approved policy is attached automatically. The guest reviews the full agreement and signs it online before checkout.

The system records:

- Agreement version and full document text.
- A SHA-256 document fingerprint, to show which exact version was signed.
- Signer's typed name, account and email address, acceptance statement, role, and signing time.

This is an electronic-signature record within the application. J & J should have the wording and signing process reviewed for the intended rental arrangement before launch, especially if a particular legal instrument requires a different signature standard.

## Payments, invoices, and receipts

Online checkout is handled by **Ozow**. The guest is redirected to Ozow's hosted checkout; the J & J website does not collect or store the guest's card number, banking password, or bank-account credentials. The business's Ozow merchant configuration controls how collected funds are settled to its nominated bank account, such as its FNB Business account. The website itself does not hold or transfer the funds.

The application sends Ozow the merchant/site code, booking/payment reference, guest name and email, amount in ZAR, checkout return address, and payment-hold expiry. The current integration does not send the guest's phone number or a government ID number. The application stores a payment record linked to the booking: payment provider, J & J merchant reference, Ozow transaction identifier, amount, payment status, hosted checkout URL, and payment time when successful. The signed Ozow notification is checked against the configured merchant/site, amount, currency, timestamp, and signature before a booking is marked paid and confirmed.

The system creates:

- **An invoice** when the room is allocated and held. It shows the guest, booking reference, accommodation, dates, total, invoice number, and invoice status.
- **A receipt** after successful payment is confirmed by Ozow. It shows the paid amount and receipt number.

Guests can view their invoices and receipts from their account and use the print/save-as-PDF option. A payment failure or incomplete payment does not confirm the stay. Refunds and reservation cancellation must follow the approved property terms and are not currently an automatic self-service refund process.

These are booking invoices and payment receipts. VAT registration, tax calculation, and accounting-software export are not currently configured as part of the booking system; J & J should confirm its required invoice wording and tax treatment before launch.

## Booking and payment notifications

The application queues email notifications for the guest and, for a new automatic room hold, the property notification address. Messages include the booking reference and relevant next steps. A successful payment notification includes a link back to the guest's account and receipt. Delivery uses Resend and a scheduled notification task; messages retry after temporary delivery failures.

Email notifications are the automated channel in the current implementation. SMS and WhatsApp are not automatic booking-notification channels. The existing WhatsApp link is for direct enquiries.

## Information collected and stored

| Information | Why it is used |
| --- | --- |
| Email address | Account sign-in and verification, linking the guest to their booking, and booking/payment emails. |
| Password | Account authentication. Supabase Auth handles password storage; the J & J application does not store or display the guest's plain-text password. |
| Full name | Booking, agreement, reception, invoice, and receipt records. The guest types their full legal name again when signing the agreement. |
| Phone number | Booking contact and agreement details. |
| Number of guests | To check the configured occupancy limit and include the guest count in the agreement. |
| Room type and stay type | To select bachelor or two-bedroom accommodation and overnight or monthly pricing. |
| Arrival and departure dates | To check availability, allocate a unit, price the stay, and reserve the room for the correct interval. |
| Optional booking note | Practical information the guest chooses to provide about the stay. Guests should not put payment credentials or unnecessary sensitive personal details in this field. |
| Booking reference, assigned unit, status and timestamps | To identify, manage, secure, and audit the reservation from creation through payment and stay completion. |
| Account identifier and role | A Supabase account ID links the guest's bookings to the correct account; the role distinguishes customer accounts from authorized administrators. |
| Agreement and signature record | To retain the agreement text/version, its fingerprint, typed names, account/email, acceptance text, signer role, and signing times. |
| Payment and invoice details | To reconcile Ozow checkout and webhook events, show payment status, issue invoices/receipts, and provide booking records. |
| Notification delivery details | Recipient email, booking reference and message-specific payload, plus queued/sent/failed status, retry count, and delivery error if one occurs. |
| Booking-request limit | The application keeps a daily request count keyed by email address to limit automated abuse. |
| Operational records | Administrators can store internal booking notes and room maintenance/owner-use blocks, including the staff account that created a block. |

The booking tables do not ask for a home address, date of birth, government ID/passport number, ID image, card number, bank password, or bank-account credentials. The booking form's optional note should be limited to practical stay information. The application booking schema does not store the guest's IP address; hosting or security logs may record technical access details under the host's own configuration and policies.

### Does the system collect identity documents or ID numbers?

**No. The current guest form does not ask for a South African ID number, passport number, date of birth, or an uploaded identity document.** It does not store a copy of an ID. The Ozow checkout request uses the booking reference in its payer ID/reference field; this is not the guest's government ID number. Ozow's staging/merchant requirements must be verified before launch. If the payment provider requires an actual identity number, that would require a deliberate change to the guest form, privacy notice, agreement, and data-handling rules first.

Reception may separately ask a guest to show identification if that is part of J & J's approved check-in policy. That would be a staff procedure outside this application's current data collection; the app does not record the ID details.

## Where the information is stored and who can access it

Booking and accommodation records are stored in the J & J Supabase project. Supabase Auth manages customer accounts and email confirmation. Application records are linked to a verified customer account when the account email matches the booking email. Customers can view their own bookings, agreements, invoices, and receipts after signing in. Administrative booking and inventory functions require an administrator account; private server credentials are used for server-side database actions and are not placed in the public website.

Ozow processes the hosted payment. Resend sends queued emails when configured. Those providers receive the information needed to perform their respective payment or email service. Payment card and bank credentials are entered on Ozow, not in the J & J accommodation form.

The application's booking database does not currently define an automatic data-deletion schedule. J & J should set a retention period and publish a privacy notice describing the data purposes, service providers, guest rights, and contact for privacy queries before accepting live customer data. Hosting providers may also produce technical/security logs under their own settings and policies.

## Management's role

Once the system is activated and the policy is approved, staff do not manually check each guest's dates, pick the room, enter the price, or prepare/sign each standard agreement. Management remains responsible for:

- One-time approval of the legal business name, occupancy limits, deposit/cancellation terms, and standard agreement policy.
- Keeping room inventory accurate and adding maintenance/owner-use blocks when needed.
- Configuring Ozow, the nominated settlement bank account, verified email sender, notification schedule, and public domain.
- Monitoring the administration calendar and notifications, handling guest questions or exceptional cases, and handing over keys to guests with confirmed bookings.
- Processing cancellations/refunds according to the approved terms and business procedures.

## Activation status and launch checklist

This guide describes the intended automated service; it is not confirmation that online booking is live today. The project code and one-time booking policy screen are prepared, but the current Supabase project still needs the automatic-reservations database migration. The owner also needs to complete the property policy and configure the external providers.

Before inviting guests to make live online bookings, J & J should:

1. Apply `supabase/migrations/202611130002_automatic_room_reservations.sql` to the Supabase project (the base booking schema is already applied there).
2. Sign in to the admin area and complete the one-time booking policy with legally reviewed terms and actual occupancy limits.
3. Configure and test the Ozow staging merchant, callback/webhook, amount matching, and settlement setup.
4. Configure the public domain, Resend sender, and scheduled email-notification delivery.
5. Complete end-to-end staging checks: availability, simultaneous attempts for the last room, automatic assignment, agreement signing, successful/failed payments, hold expiry, invoices, receipts, and guest emails.
6. Approve a privacy notice and data-retention approach before collecting live guest information.

Until those steps pass, guests should not be told that the automated payment-and-confirmation process is live. Existing older requests created before the automatic-reservation migration remain requests and may still need staff review.
