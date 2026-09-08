import { NextRequest } from 'next/server';
import { eventBus } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connect ping
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', orderNumber })}\n\n`)
      );

      // Event listener
      const onOrderEvent = (data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (e) {
          // Stream might be closed
        }
      };

      const eventKey = `order:${orderNumber}`;
      eventBus.on(eventKey, onOrderEvent);

      // Keep-alive heartbeat every 20s
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        eventBus.off(eventKey, onOrderEvent);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}