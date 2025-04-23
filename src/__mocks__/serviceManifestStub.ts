type ManifestField = {
  field: string;
  required?: boolean;
  type?: string;
  default?: any;
};

const serviceManifests: Record<string, ManifestField[]> = {};
const clientServiceMap: Record<string, string> = {};

export const registerServiceManifest = async (
  serviceId: string,
  manifest: ManifestField[]
): Promise<void> => {
  const existing = serviceManifests[serviceId] || [];
  const merged = [...existing, ...manifest];

  const deduped = Object.values(
    merged.reduce((acc, field) => {
      acc[field.field] = field;
      return acc;
    }, {} as Record<string, ManifestField>)
  );

  serviceManifests[serviceId] = deduped;
};

export const updateServiceManifest = async (
  serviceId: string,
  manifest: ManifestField[]
): Promise<void> => {
  await registerServiceManifest(serviceId, manifest);
};

export const resetServiceManifests = async (): Promise<void> => {
  Object.keys(serviceManifests).forEach(key => delete serviceManifests[key]);
  Object.keys(clientServiceMap).forEach(key => delete clientServiceMap[key]);
};

export const getServiceManifest = (serviceId: string): ManifestField[] => {
  return serviceManifests[serviceId] || [];
};

export const linkClientToService = (clientId: string, serviceId: string): void => {
  clientServiceMap[clientId] = serviceId;
};

export const getClientServiceId = (clientId: string): string | undefined => {
  return clientServiceMap[clientId];
};
