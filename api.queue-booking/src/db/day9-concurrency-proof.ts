import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source';

// Day 9 concurrency proof: fires two POST /bookings for the SAME slot at the
// same time via Promise.all (not sequential awaits — both requests are
// in flight together), and asserts exactly one comes back 201 and the other
// 409. Talks to the real running API over HTTP, not the service directly, so
// this exercises the actual controller -> transaction -> DB path.
//
// Sets up its own isolated slot + two customers (marker email domain / a
// dedicated marker appointment_date), tears them down after — never touches
// the real Day 1 seed data or the Day 6 bench data.
const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3025/api';
const PROOF_MARKER_DATE = '1900-02-01';
const PROOF_EMAIL_DOMAIN = 'day9-proof.local';

interface BookingResult {
  status: number;
  body: unknown;
}

async function postBooking(
  slotId: string,
  customerId: string,
): Promise<BookingResult> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slotId,
      customerId,
      notes: 'Day 9 concurrency proof',
    }),
  });
  const body: unknown = await res.json();
  return { status: res.status, body };
}

async function main() {
  await AppDataSource.initialize();

  const slotId = randomUUID();
  const customerAId = randomUUID();
  const customerBId = randomUUID();

  try {
    await AppDataSource.query(
      `INSERT INTO slots (id, capacity, appointment_date, start_time, end_time, is_available) VALUES (@0, 1, @1, '09:00:00', '09:30:00', 1)`,
      [slotId, PROOF_MARKER_DATE],
    );
    await AppDataSource.query(
      `INSERT INTO customers (id, first_name, last_name, email, password) VALUES (@0, 'Proof', 'CustomerA', @1, 'proof-password')`,
      [customerAId, `a-${Date.now()}@${PROOF_EMAIL_DOMAIN}`],
    );
    await AppDataSource.query(
      `INSERT INTO customers (id, first_name, last_name, email, password) VALUES (@0, 'Proof', 'CustomerB', @1, 'proof-password')`,
      [customerBId, `b-${Date.now()}@${PROOF_EMAIL_DOMAIN}`],
    );

    console.log(`Contested slot:  ${slotId}`);
    console.log(`Customer A:      ${customerAId}`);
    console.log(`Customer B:      ${customerBId}`);
    console.log(`\nFiring both POST /bookings at once via Promise.all...\n`);

    const started = Date.now();
    const [resA, resB] = await Promise.all([
      postBooking(slotId, customerAId),
      postBooking(slotId, customerBId),
    ]);
    const elapsedMs = Date.now() - started;

    console.log(`=== Customer A -> HTTP ${resA.status} ===`);
    console.log(JSON.stringify(resA.body, null, 2));
    console.log(`\n=== Customer B -> HTTP ${resB.status} ===`);
    console.log(JSON.stringify(resB.body, null, 2));

    const statuses = [resA.status, resB.status].sort((x, y) => x - y);
    const pass = statuses[0] === 201 && statuses[1] === 409;

    console.log(
      `\nElapsed: ${elapsedMs}ms for both requests together (true concurrency, not sequential).`,
    );
    console.log(
      pass
        ? '\nPASS: exactly one 201 and one 409.'
        : `\nFAIL: expected [201, 409], got [${statuses.join(', ')}].`,
    );

    if (!pass) {
      process.exitCode = 1;
    }
  } finally {
    // Cleanup: remove whichever booking landed, then the proof slot/customers.
    // Never touches real seed or bench data — scoped to this run's own ids.
    await AppDataSource.query(`DELETE FROM bookings WHERE slot_id = @0`, [
      slotId,
    ]);
    await AppDataSource.query(`DELETE FROM slots WHERE id = @0`, [slotId]);
    await AppDataSource.query(`DELETE FROM customers WHERE id IN (@0, @1)`, [
      customerAId,
      customerBId,
    ]);
    console.log('\nCleanup complete — proof slot/customers/booking removed.');
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
