type Message = {
  id: string;
  body: string;
  timestamp: number;
};

type MessageQueue = Record<string, Record<string, Message[]>>; // serviceId -> clientId -> messages
type AcknowledgedMessages = Record<string, Record<string, Set<string>>>; // serviceId -> clientId -> set of message IDs

const queues: MessageQueue = {};
const acknowledged: AcknowledgedMessages = {};

let messageSequence = 0;

export async function enqueueMessage(
  serviceId: string,
  clientId: string,
  body: string,
  id: string
): Promise<void> {
  queues[serviceId] = queues[serviceId] || {};
  queues[serviceId][clientId] = queues[serviceId][clientId] || [];

  const alreadyExists = queues[serviceId][clientId].some(msg => msg.id === id);
  if (alreadyExists) return;

  queues[serviceId][clientId].push({
    id,
    body,
    timestamp: ++messageSequence,
  });
}

export async function acknowledgeMessage(
  serviceId: string,
  clientId: string,
  messageId: string
): Promise<void> {
  acknowledged[serviceId] = acknowledged[serviceId] || {};
  acknowledged[serviceId][clientId] = acknowledged[serviceId][clientId] || new Set();

  acknowledged[serviceId][clientId].add(messageId);

  queues[serviceId][clientId] = (queues[serviceId][clientId] || []).filter(
    msg => msg.id !== messageId
  );
}

export async function getPendingMessagesForService(
  serviceId: string,
  clientId: string
): Promise<Message[]> {
  return queues[serviceId]?.[clientId] || [];
}

export async function simulateServiceReconnect(serviceId: string): Promise<void> {
  // No-op: queues are already in memory
}

export async function clearQueue(): Promise<void> {
  for (const service in queues) {
    delete queues[service];
  }
  for (const service in acknowledged) {
    delete acknowledged[service];
  }
  messageSequence = 0;
}
