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
        const rejectedBookings = changedBookings.filter((b: any) => b.new_status === 'rejected');
        const completedBookings = changedBookings.filter((b: any) => b.new_status === 'completed');

        // 2. Insert Daily Report & Notifications for COMPLETED bookings
        if (completedBookings.length > 0) {

            // Group the completed bookings by Car Owner safely
            const bookingsByOwner: Record<string, string[]> = {};

            for (const booking of completedBookings) {
                if (!booking.owner_id) {
                    console.error(`Missing owner_id for booking ${booking.booking_id}! Did you forget to run the Section 2.1 SQL migration?`);
                    continue; // Skip so we don't crash Postgres with undefined::uuid
                }
                if (!bookingsByOwner[booking.owner_id]) {
                    bookingsByOwner[booking.owner_id] = [];
                }
                bookingsByOwner[booking.owner_id].push(booking.booking_id);
            }

            // For every unique Car Owner whose bookings completed yesterday
            for (const [ownerId, bookingIds] of Object.entries(bookingsByOwner)) {

                // Isolate the values safely outside the DB query to avoid string-parsing conflicts
                const totalCompleted = bookingIds.length;
                const messageBody = `${totalCompleted} of your bookings ended yesterday and are marked completed.`;
                const idsJson = JSON.stringify(bookingIds);

                // Insert a Daily Report record for this specific owner (with explicit Postgres type casting)
                await sql`
          insert into public.daily_reports (owner_id, total_completed, booking_ids, status, created_at)
          values (
            ${ownerId}::uuid, 
            ${totalCompleted}::int,
            ${idsJson}::jsonb,
            'completed',
            NOW()
          )
        `;

                // Create a notification for the owner
                await sql`
          insert into public.notifications (receiver_id, sender_id, reference_id, title, body, type)
          values (
            ${ownerId}::uuid,
            ${ownerId}::uuid,
            ${bookingIds[0]}::uuid,
            'Daily Booking Report',
            ${messageBody},
            'system'
          )
        `;
            }
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
