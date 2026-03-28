// notify-bookings/index.ts
import postgres from "postgres"; // Now securely mapped via deno.json!

const DB_URL = Deno.env.get("SUPABASE_DB_URL");
const sql = postgres(DB_URL);

Deno.serve(async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // 1. Call our DB Function to trigger the changes and get the updated rows
        const changedBookings = await sql`select * from public.auto_update_daily_bookings_status()`;

        if (changedBookings.length < 1) {
            return new Response(
                JSON.stringify({ ok: true, message: "No bookings from yesterday needed updates." }),
                { headers: { "Content-Type": "application/json" } }
            );
        }

        // Separate based on the NEW status returned
        const rejectedBookings = changedBookings.filter(b => b.new_status === 'rejected');
        const completedBookings = changedBookings.filter(b => b.new_status === 'completed');

        // 2. Insert Daily Report & Notifications for COMPLETED bookings
        if (completedBookings.length > 0) {
            const completedIds = completedBookings.map(b => b.booking_id);

            // Insert a Daily Report record
            await sql`
        insert into public.daily_reports (owner_id, total_completed, booking_ids, status, created_at)
        values (
          ${completedBookings[0].customer_id}, 
          ${completedBookings.length},
          ${JSON.stringify(completedIds)},
          'completed',
          NOW()
        )
      `;

            // Create a notification for the customer
            await sql`
        insert into public.notifications (sender_id, receiver_id, reference_id, title, body, type)
        values (
          ${completedBookings[0].customer_id},
          ${completedBookings[0].customer_id},
          ${completedBookings[0].booking_id},
          'Daily Booking Report',
          '${completedBookings.length} of your bookings ended yesterday and are completed.',
          'daily_report'
        )
      `;
        }

        return new Response(
            JSON.stringify({
                ok: true,
                message: `Successfully updated ${rejectedBookings.length} to rejected, ${completedBookings.length} to completed.`,
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
});
