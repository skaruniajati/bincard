// In-memory event broadcaster for Server-Sent Events (SSE)
type Listener = (data: { event: string; payload: any }) => void;

class RealtimeBroadcaster {
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(event: string, payload: any) {
    this.listeners.forEach((listener) => {
      try {
        listener({ event, payload });
      } catch (err) {
        console.error("Error broadcasting to listener:", err);
      }
    });
  }

  public getSubscriberCount(): number {
    return this.listeners.size;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var realtimeBroadcaster: RealtimeBroadcaster | undefined;
}

export const realtime = global.realtimeBroadcaster || new RealtimeBroadcaster();

if (process.env.NODE_ENV !== "production") {
  global.realtimeBroadcaster = realtime;
}

export default realtime;
