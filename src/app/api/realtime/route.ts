import { realtime } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Kirim event koneksi awal
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`));

      // Berlangganan ke event broadcaster
      const unsubscribe = realtime.subscribe((data) => {
        try {
          const chunk = `event: ${data.event}\ndata: ${JSON.stringify(data.payload)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        } catch (err) {
          console.error("Gagal mengirim event SSE:", err);
        }
      });

      // Keep-alive heartbeat interval setiap 20 detik
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 20000);

      // Tangani abort/close koneksi dari browser
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
