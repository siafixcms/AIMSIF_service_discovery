// src/rpc/types.ts

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any[] | object;
  id: string | number | null;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}
