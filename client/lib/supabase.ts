import { createClient, RealtimeChannel } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export const orderTopic = (orderId: string) => `order:${orderId}`;
export const storeTopic = (storeId: string) => `store:${storeId}`;
export const ORDERS_TOPIC = 'orders';

const channels: Record<string, RealtimeChannel> = {};


type Listener = (event: string, payload: any) => void;
const listeners: Record<string, Listener[]> = {};

const getChannel = (topic: string) => {
  if (!channels[topic]) { listeners[topic] = [];
    channels[topic] = supabase.channel(topic);

    channels[topic].on('broadcast', { event: '*' }, (message) => {
      listeners[topic].forEach((listener) => listener(message.event, message.payload));
    });

    channels[topic].subscribe();
  }
  return channels[topic];
};

export const listen = (topic: string, listener: Listener) => {
  getChannel(topic);
  listeners[topic].push(listener);

  return () => {
    listeners[topic] = listeners[topic].filter((l) => l !== listener);
  };
};

export const broadcast = (topic: string, event: string, payload: object) => {
  getChannel(topic).send({ type: 'broadcast', event, payload });
};
