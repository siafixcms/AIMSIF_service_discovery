// __mocks__/mockClientService.ts

type Client = {
  email: string;
  passwordHash: string;
};

let clients: Client[] = [];

export const mockClientService = {
  getClientByEmail: async (email: string): Promise<Client | null> => {
    const client = clients.find(c => c.email === email);
    return client || null;
  },
  registerClient: (client: Client) => {
    clients.push(client);
  },
  reset: () => {
    clients = [];
  },
};
