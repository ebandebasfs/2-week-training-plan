import QueueTicket from "../components/queue-ticket";

export default function HydrationDrillPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-lg font-semibold text-zinc-900">Hydration drill</h1>
        <p className="text-sm text-zinc-500">
          QueueTicket computes Math.random() in its render body. Hard-refresh this
          page (not a client-side nav) and check the browser console / error overlay.
        </p>
        <QueueTicket />
      </div>
    </div>
  );
}
