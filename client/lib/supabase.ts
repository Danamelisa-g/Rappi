import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Supabase solo se usa para el tiempo real (Broadcast).
// Los datos (crear pedidos, posiciones, etc.) siguen pasando por nuestra API con axios.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// Nombres de los canales
//   order:<id>  -> el repartidor manda 'position-update' y 'status-change' al cliente
//   store:<id>  -> se avisa a la tienda que un pedido cambió de estado
//   orders      -> se avisa a los repartidores que cambió la lista de disponibles
export const orderTopic = (orderId: string) => `order:${orderId}`;
export const storeTopic = (storeId: string) => `store:${storeId}`;
export const ORDERS_TOPIC = 'orders';

// Supabase no deja suscribirse dos veces al mismo canal,
// así que guardamos cada canal la primera vez que se crea y luego lo reutilizamos.
const channels: Record<string, RealtimeChannel> = {};

// Funciones que quieren enterarse de los mensajes de cada canal
type Listener = (event: string, payload: any) => void;
const listeners: Record<string, Listener[]> = {};

const getChannel = (topic: string) => {
  if (!channels[topic]) {
    listeners[topic] = [];
    channels[topic] = supabase.channel(topic);

    // Cuando llega un mensaje, se lo pasamos a todos los que están escuchando
    channels[topic].on('broadcast', { event: '*' }, (message) => {
      listeners[topic].forEach((listener) => listener(message.event, message.payload));
    });

    channels[topic].subscribe();
  }
  return channels[topic];
};

// Escuchar un canal. Devuelve una función para dejar de escuchar.
export const listen = (topic: string, listener: Listener) => {
  getChannel(topic);
  listeners[topic].push(listener);

  return () => {
    listeners[topic] = listeners[topic].filter((l) => l !== listener);
  };
};

// Enviar un mensaje por un canal (igual al ejemplo del profe: channel.send)
export const broadcast = (topic: string, event: string, payload: object) => {
  getChannel(topic).send({ type: 'broadcast', event, payload });
};
