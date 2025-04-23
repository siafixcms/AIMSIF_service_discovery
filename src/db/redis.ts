const store: Record<string, string> = {};

export const get = async (key: string): Promise<string | undefined> => {
  return store[key];
};

export const set = async (key: string, value: string): Promise<void> => {
  store[key] = value;
};

export const mockResolvedValueOnce = (key: string, value: string): void => {
  store[key] = value;
};

export const reset = (): void => {
  Object.keys(store).forEach(key => delete store[key]);
};
