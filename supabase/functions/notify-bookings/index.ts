// notify-bookings/index.ts
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const DB_URL = Deno.env.get("SUPABASE_DB_URL")!;
// const PROVIDER_API_KEY = Deno.env.get("PROVIDER_API_KEY")!; // set this via supabase secrets
const sql = postgres(DB_URL);

// helper to send notification (replace with real provider)
// async function sendNotificationToOwner(ownerId: string, messageBody: any) {
// Example: POST to custom notification service
//   const res = await fetch("https://your-notification-provider.example/send", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${PROVIDER_API_KEY}`,
//     },
//     body: JSON.stringify({
//       owner_id: ownerId,
//       message: messageBody,
//     }),
//   });
//   const json = await res.json().catch(() => null);
//   return { status: res.status, body: json };
// }

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // 1) Get today's bookings from DB function
    const bookings = await sql`select * from public.get_todays_bookings()`;
    // bookings is an array of rows: { booking_id, owner_id, car_id, ... }

    // 2) Group by owner_id
    const groups = new Map();
    for (const row of bookings) {
      const owner = String(row.owner_id);
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner).push({
        booking_id: String(row.booking_id),
        car_id: String(row.car_id),
        user_id: String(row.user_id),
        start_time: row.start_time,
        end_time: row.end_time,
      });
    }

    // let sent = 0;
    const failures: any[] = [];

    // 3) For each owner, prepare message and perform idempotent insert into notifications table
    for (const [ownerId, ownerBookings] of groups.entries()) {
      // Build message (customize)
      //   const message = {
      //     title: "Bookings for today",
      //     items: ownerBookings.map((b: any) => ({
      //       booking_id: b.booking_id,
      //       car_id: b.car_id,
      //       start_time: b.start_time,
      //       end_time: b.end_time,
      //     })),
      //   };

      // Try to insert one notification record per owner for this run.
      // For owner-level summary we need some booking_id placeholder: pick the first booking id or make it null and rely on unique constraint differently.
      const firstBookingId = ownerBookings[0].booking_id;

      // Attempt to insert notification row with CONFLICT DO NOTHING to ensure idempotency
      const insertRes = await sql`
        insert into public.notifications (reference_id, receiver_id, title, body, type, is_read, created_at) values (${firstBookingId}::uuid, ${ownerId}::uuid, 'Daily booking summary', null, 'daily-summary', false, now()) on conflict (reference_id, type) do nothing returning id;
      `;

      const inserted = insertRes.length > 0;
      if (!inserted) {
        // Already notified (or another instance handled it)
        continue;
      }

      // Send notification via provider
      //   try {
      //     const providerRes = await sendNotificationToOwner(ownerId, message);
      //     // update notification row with result
      //     await sql`
      //       update public.notifications
      //       set status = ${providerRes.status >= 200 && providerRes.status < 300 ? 'sent' : 'failed'},
      //           sent_at = now(),
      //           provider_response = ${JSON.stringify(providerRes.body || null)}::jsonb
      //       where booking_id = ${firstBookingId}::uuid and notification_type = 'daily-summary';
      //     `;
      //     if (providerRes.status >= 200 && providerRes.status < 300) {
      //       sent++;
      //     } else {
      //       failures.push({ ownerId, status: providerRes.status, body: providerRes.body });
      //     }
      //   } catch (err) {
      //     // provider failure
      //     await sql`
      //       update public.notifications
      //       set status = 'failed',
      //           sent_at = now(),
      //           provider_response = ${JSON.stringify({ error: String(err) })}::jsonb
      //       where booking_id = ${firstBookingId}::uuid and notification_type = 'daily-summary';
      //     `;
      //     failures.push({ ownerId, error: String(err) });
      //   }
    }

    return new Response(JSON.stringify({ ok: true, failures }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-bookings error:", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
