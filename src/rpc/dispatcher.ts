// src/rpc/dispatcher.ts

import { JSONRPCRequest, JSONRPCResponse } from './types';
import { handleRpcRequest } from './service.handler';

export async function dispatchRpc(
  request: JSONRPCRequest
): Promise<JSONRPCResponse> {
  return handleRpcRequest(request);
}
