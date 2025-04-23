import * as service from '../service';
import { JSONRPCRequest, JSONRPCResponse } from './types';
import { name as serviceName } from '../../package.json';

type ServiceMethods = typeof service;

function isServiceMethod(method: string): method is keyof ServiceMethods {
  return typeof (service as any)[method] === 'function';
}

export async function handleRpcRequest(
  request: JSONRPCRequest
): Promise<JSONRPCResponse> {
  const { id, method, params } = request;

  if (!isServiceMethod(method)) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method '${method}' not found in service '${serviceName}'`,
      },
    };
  }

  try {
    const result = await (service[method] as (...args: any[]) => any)(
      ...(Array.isArray(params) ? params : [params])
    );

    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error.message || 'Internal server error',
      },
    };
  }
}
