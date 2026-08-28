export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValueParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface AuthConfig {
  type: AuthType;
  bearerToken: string;
  username: string;
  password: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyAddTo: 'header' | 'query';
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'graphql';

export interface RequestBody {
  type: BodyType;
  rawJson: string;
  formData: KeyValueParam[];
  urlEncoded: KeyValueParam[];
  rawText: string;
  graphqlQuery: string;
  graphqlVariables: string;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValueParam[];
  headers: KeyValueParam[];
  auth: AuthConfig;
  body: RequestBody;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: any;
  rawText: string;
  contentType: string;
  error?: string;
  timestamp: number;
}

export interface RequestTab {
  id: string;
  title: string;
  request: ApiRequest;
  response: ApiResponse | null;
  isLoading: boolean;
  isDirty: boolean;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
}

export interface CollectionItem {
  id: string;
  name: string;
  type: 'folder' | 'request';
  request?: ApiRequest;
  children?: CollectionItem[];
  isOpen?: boolean;
}

export interface HistoryItem {
  id: string;
  request: ApiRequest;
  response: ApiResponse | null;
  timestamp: number;
}

export interface MockEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  responseBody: string;
  delayMs: number;
  enabled: boolean;
}
