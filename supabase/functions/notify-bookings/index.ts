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

  const bookings = await sql`select * from public.get_todays_bookings()`;
  try {
    // 1) Get today's bookings from DB function
    // bookings is an array of rows: { booking_id, owner_id, car_id, ... }
    // 2) Group by owner_id
    const groups = new Map();
    for (const row of bookings) {
      if (!row.owner_id) continue;
      const owner = String(row.owner_id);
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner).push({
        booking_id: String(row.booking_id),
        car_id: String(row.car_id),
        customer_id: String(row.customer_id),
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

      // Attempt to insert a one-per-owner daily summary notification for today (idempotent)
      const insertRes = await sql`
        insert into public.notifications (reference_id, receiver_id, title, body, type, is_read, created_at)
        select ${firstBookingId}::uuid, ${ownerId}::uuid, 'Daily booking summary', 'You have bookings starting today.', 'booking_update', false, now()
        where not exists (
          select 1 from public.notifications
          where receiver_id = ${ownerId}::uuid
            and type = 'booking_update'
            and date(created_at at time zone 'UTC') = current_date at time zone 'UTC'
        )
        returning id;
      `;

      const inserted = insertRes.length > 0;
      if (!inserted) {
        // Already notified for today (or another concurrent run handled it)
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

    return new Response(
      JSON.stringify({ ok: true, failures, todaybookings: bookings }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("notify-bookings error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(error),
        todaybookings: bookings,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

//
/*
  curl -i --location --request POST 'https://tapevnzpzdhwfzhpfvuy.supabase.co/functions/v1/notify-bookings' --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcGV2bnpwemRod2Z6aHBmdnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzUyODcsImV4cCI6MjA4ODgxMTI4N30.98WEW5zZHIqGOZ9ptABGcFNHMXgJ785TtqYJgAJCB9o' --header 'Content-Type: application/json'
  */
