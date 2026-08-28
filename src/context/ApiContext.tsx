import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ApiRequest,
  ApiResponse,
  CollectionItem,
  Environment,
  EnvironmentVariable,
  HistoryItem,
  RequestTab,
} from '../types/api';
import { interpolateVariables } from '../utils/envInterpolator';
import { handleMockRequest } from '../utils/mockEngine';
import { parseCurlCommand } from '../utils/curlParser';

interface ApiContextType {
  tabs: RequestTab[];
  activeTabId: string;
  environments: Environment[];
  collections: CollectionItem[];
  history: HistoryItem[];
  activeTab: RequestTab | undefined;
  activeEnvironment: Environment | undefined;
  useProxy: boolean;
  
  setUseProxy: (val: boolean) => void;
  setActiveTabId: (id: string) => void;
  addTab: (initialRequest?: Partial<ApiRequest>) => void;
  closeTab: (id: string) => void;
  duplicateTab: (id: string) => void;
  updateTabRequest: (tabId: string, updates: Partial<ApiRequest>) => void;
  sendRequest: (tabId?: string) => Promise<void>;
  cancelRequest: (tabId: string) => void;
  
  createEnvironment: (name: string) => void;
  deleteEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string) => void;
  updateEnvironmentVariables: (envId: string, variables: EnvironmentVariable[]) => void;
  
  createCollection: (name: string) => void;
  deleteCollectionItem: (itemId: string) => void;
  saveCurrentRequestToCollection: (collectionId: string, name: string) => void;
  loadRequestIntoTab: (request: ApiRequest) => void;
  
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  importCurlString: (curl: string) => boolean;
}

const ApiContext = createContext<ApiContextType | null>(null);

const DEFAULT_REQUEST: ApiRequest = {
  id: 'req-default-1',
  name: 'Get Users List',
  method: 'GET',
  url: 'https://api.example.com/users',
  params: [
    { id: 'p1', key: 'page', value: '1', enabled: true, description: 'Page number' },
    { id: 'p2', key: 'limit', value: '10', enabled: true, description: 'Results limit' },
  ],
  headers: [
    { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
    { id: 'h2', key: 'User-Agent', value: 'ReqOra-Studio/1.0', enabled: true },
  ],
  auth: {
    type: 'none',
    bearerToken: '',
    username: '',
    password: '',
    apiKeyKey: 'X-API-Key',
    apiKeyValue: '',
    apiKeyAddTo: 'header',
  },
  body: {
    type: 'json',
    rawJson: '{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "role": "Developer"\n}',
    formData: [],
    urlEncoded: [],
    rawText: '',
    graphqlQuery: 'query GetUser {\n  user(id: 1) {\n    id\n    name\n    email\n  }\n}',
    graphqlVariables: '{\n  "id": 1\n}',
  },
};

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: 'env-dev',
    name: 'Development',
    isActive: true,
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://api.example.com', enabled: true },
      { id: 'v2', key: 'apiKey', value: 'dev_sec_98471937', enabled: true },
      { id: 'v3', key: 'version', value: 'v1', enabled: true },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    isActive: false,
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://api.myapp.com', enabled: true },
      { id: 'v2', key: 'apiKey', value: 'prod_live_83719472', enabled: true },
      { id: 'v3', key: 'version', value: 'v2', enabled: true },
    ],
  },
];

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    name: 'User Management API',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'col-req-1',
        name: 'Get Users List (Mock)',
        type: 'request',
        request: { ...DEFAULT_REQUEST, id: 'req-col-1', url: '{{baseUrl}}/users' },
      },
      {
        id: 'col-req-2',
        name: 'User Login (Mock)',
        type: 'request',
        request: {
          ...DEFAULT_REQUEST,
          id: 'req-col-2',
          name: 'User Login',
          method: 'POST',
          url: '{{baseUrl}}/auth/login',
          body: {
            ...DEFAULT_REQUEST.body,
            rawJson: '{\n  "username": "admin",\n  "password": "secretpassword"\n}',
          },
        },
      },
      {
        id: 'col-req-3',
        name: 'System Health Check',
        type: 'request',
        request: {
          ...DEFAULT_REQUEST,
          id: 'req-col-3',
          name: 'System Health Check',
          method: 'GET',
          url: '{{baseUrl}}/health',
        },
      },
    ],
  },
];

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<RequestTab[]>(() => {
    const saved = localStorage.getItem('reqora_tabs') || localStorage.getItem('apex_api_tabs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [{
      id: 'tab-1',
      title: 'Get Users List',
      request: DEFAULT_REQUEST,
      response: null,
      isLoading: false,
      isDirty: false,
    }];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return tabs[0]?.id || 'tab-1';
  });

  const [environments, setEnvironments] = useState<Environment[]>(() => {
    const saved = localStorage.getItem('reqora_environments') || localStorage.getItem('apex_api_environments');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_ENVIRONMENTS;
  });

  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    const saved = localStorage.getItem('reqora_collections') || localStorage.getItem('apex_api_collections');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_COLLECTIONS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('reqora_history') || localStorage.getItem('apex_api_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [useProxy, setUseProxy] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('reqora_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('reqora_environments', JSON.stringify(environments));
  }, [environments]);

  useEffect(() => {
    localStorage.setItem('reqora_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('reqora_history', JSON.stringify(history));
  }, [history]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeEnvironment = environments.find((e) => e.isActive);

  const addTab = (initialRequest?: Partial<ApiRequest>) => {
    const newId = 'tab-' + Math.random().toString(36).substring(2, 9);
    const newReq: ApiRequest = {
      ...DEFAULT_REQUEST,
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      name: initialRequest?.name || 'New Request',
      ...initialRequest,
    };
    const newTab: RequestTab = {
      id: newId,
      title: newReq.name,
      request: newReq,
      response: null,
      isLoading: false,
      isDirty: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const targetIdx = tabs.findIndex((t) => t.id === id);
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);
    if (activeTabId === id) {
      const nextActive = updated[Math.max(0, targetIdx - 1)];
      setActiveTabId(nextActive.id);
    }
  };

  const duplicateTab = (id: string) => {
    const sourceTab = tabs.find((t) => t.id === id);
    if (!sourceTab) return;
    addTab({
      ...sourceTab.request,
      name: `${sourceTab.request.name} (Copy)`,
    });
  };

  const updateTabRequest = (tabId: string, updates: Partial<ApiRequest>) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === tabId) {
          const updatedReq = { ...tab.request, ...updates };
          return {
            ...tab,
            title: updatedReq.name || tab.title,
            request: updatedReq,
            isDirty: true,
          };
        }
        return tab;
      })
    );
  };

  const sendRequest = async (targetTabId?: string) => {
    const idToUse = targetTabId || activeTabId;
    const tabToRun = tabs.find((t) => t.id === idToUse);
    if (!tabToRun) return;

    setTabs((prev) =>
      prev.map((t) => (t.id === idToUse ? { ...t, isLoading: true } : t))
    );

    const activeEnvVars = activeEnvironment?.variables || [];
    const rawReq = tabToRun.request;

    const finalUrl = interpolateVariables(rawReq.url, activeEnvVars);

    const activeParams = rawReq.params.filter((p) => p.enabled && p.key.trim());
    let urlWithParams = finalUrl;
    if (activeParams.length > 0) {
      const searchParams = new URLSearchParams();
      activeParams.forEach((p) => {
        const interpolatedVal = interpolateVariables(p.value, activeEnvVars);
        const interpolatedKey = interpolateVariables(p.key, activeEnvVars);
        searchParams.append(interpolatedKey, interpolatedVal);
      });
      urlWithParams += (urlWithParams.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const mockResult = handleMockRequest({
      ...rawReq,
      url: urlWithParams,
    });

    let responseResult: ApiResponse;

    if (mockResult) {
      await new Promise((res) => setTimeout(res, 250));
      responseResult = mockResult;
    } else {
      const startTime = performance.now();
      const headersObj: Record<string, string> = {};

      rawReq.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          headersObj[interpolateVariables(h.key, activeEnvVars)] = interpolateVariables(
            h.value,
            activeEnvVars
          );
        });

      if (rawReq.auth.type === 'bearer' && rawReq.auth.bearerToken) {
        headersObj['Authorization'] = `Bearer ${interpolateVariables(
          rawReq.auth.bearerToken,
          activeEnvVars
        )}`;
      } else if (rawReq.auth.type === 'basic' && (rawReq.auth.username || rawReq.auth.password)) {
        const creds = btoa(
          `${interpolateVariables(rawReq.auth.username, activeEnvVars)}:${interpolateVariables(
            rawReq.auth.password,
            activeEnvVars
          )}`
        );
        headersObj['Authorization'] = `Basic ${creds}`;
      } else if (rawReq.auth.type === 'apikey' && rawReq.auth.apiKeyAddTo === 'header' && rawReq.auth.apiKeyKey) {
        headersObj[rawReq.auth.apiKeyKey] = interpolateVariables(rawReq.auth.apiKeyValue, activeEnvVars);
      }

      let bodyData: any = undefined;
      if (rawReq.body.type === 'json' && rawReq.body.rawJson) {
        bodyData = interpolateVariables(rawReq.body.rawJson, activeEnvVars);
        if (!headersObj['Content-Type']) headersObj['Content-Type'] = 'application/json';
      } else if (rawReq.body.type === 'raw' && rawReq.body.rawText) {
        bodyData = interpolateVariables(rawReq.body.rawText, activeEnvVars);
      } else if (rawReq.body.type === 'x-www-form-urlencoded') {
        const activeForm = rawReq.body.urlEncoded.filter((f) => f.enabled && f.key.trim());
        const bodyParams = new URLSearchParams();
        activeForm.forEach((f) => {
          bodyParams.append(
            interpolateVariables(f.key, activeEnvVars),
            interpolateVariables(f.value, activeEnvVars)
          );
        });
        bodyData = bodyParams.toString();
        if (!headersObj['Content-Type']) headersObj['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      const executeFetch = async (targetEndpoint: string) => {
        const res = await fetch(targetEndpoint, {
          method: rawReq.method,
          headers: headersObj,
          body: rawReq.method !== 'GET' && rawReq.method !== 'HEAD' ? bodyData : undefined,
        });
        const endTime = performance.now();
        const text = await res.text();
        let jsonRes = null;
        const cType = res.headers.get('content-type') || '';

        if (cType.includes('application/json')) {
          try { jsonRes = JSON.parse(text); } catch {}
        }

        const resHeaders: Record<string, string> = {};
        res.headers.forEach((val, key) => {
          resHeaders[key] = val;
        });

        return {
          status: res.status,
          statusText: res.statusText || 'OK',
          timeMs: Math.round(endTime - startTime),
          sizeBytes: new Blob([text]).size,
          headers: resHeaders,
          data: jsonRes || text,
          rawText: text,
          contentType: cType,
          timestamp: Date.now(),
        };
      };

      try {
        if (useProxy) {
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlWithParams)}`;
          responseResult = await executeFetch(proxyUrl);
        } else {
          responseResult = await executeFetch(urlWithParams);
        }
      } catch (err: any) {
        try {
          const fallbackProxyUrl = `/api/proxy?url=${encodeURIComponent(urlWithParams)}`;
          responseResult = await executeFetch(fallbackProxyUrl);
        } catch (proxyErr: any) {
          const endTime = performance.now();
          responseResult = {
            status: 0,
            statusText: 'Network Error / Blocked',
            timeMs: Math.round(endTime - startTime),
            sizeBytes: 0,
            headers: {},
            data: null,
            rawText: proxyErr.message || err.message || 'Failed to execute request.',
            contentType: 'text/plain',
            error: proxyErr.message || err.message || 'Network Request Failed',
            timestamp: Date.now(),
          };
        }
      }
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === idToUse
          ? {
              ...t,
              response: responseResult,
              isLoading: false,
              isDirty: false,
            }
          : t
      )
    );

    const historyItem: HistoryItem = {
      id: 'hist-' + Math.random().toString(36).substring(2, 9),
      request: rawReq,
      response: responseResult,
      timestamp: Date.now(),
    };

    setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
  };

  const cancelRequest = (tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, isLoading: false } : t))
    );
  };

  const createEnvironment = (name: string) => {
    const newEnv: Environment = {
      id: 'env-' + Math.random().toString(36).substring(2, 9),
      name,
      isActive: false,
      variables: [{ id: 'v-1', key: '', value: '', enabled: true }],
    };
    setEnvironments((prev) => [...prev, newEnv]);
  };

  const deleteEnvironment = (id: string) => {
    setEnvironments((prev) => prev.filter((e) => e.id !== id));
  };

  const setActiveEnvironment = (id: string) => {
    setEnvironments((prev) =>
      prev.map((e) => ({ ...e, isActive: e.id === id }))
    );
  };

  const updateEnvironmentVariables = (envId: string, variables: EnvironmentVariable[]) => {
    setEnvironments((prev) =>
      prev.map((e) => (e.id === envId ? { ...e, variables } : e))
    );
  };

  const createCollection = (name: string) => {
    const newCol: CollectionItem = {
      id: 'col-' + Math.random().toString(36).substring(2, 9),
      name,
      type: 'folder',
      isOpen: true,
      children: [],
    };
    setCollections((prev) => [...prev, newCol]);
  };

  const deleteCollectionItem = (itemId: string) => {
    const removeItemRecursive = (items: CollectionItem[]): CollectionItem[] => {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) => {
          if (item.children) {
            return { ...item, children: removeItemRecursive(item.children) };
          }
          return item;
        });
    };
    setCollections((prev) => removeItemRecursive(prev));
  };

  const saveCurrentRequestToCollection = (collectionId: string, name: string) => {
    if (!activeTab) return;
    const reqToSave: ApiRequest = {
      ...activeTab.request,
      name,
    };

    const newItem: CollectionItem = {
      id: 'col-req-' + Math.random().toString(36).substring(2, 9),
      name,
      type: 'request',
      request: reqToSave,
    };

    const addReqToColRecursive = (items: CollectionItem[]): CollectionItem[] => {
      return items.map((item) => {
        if (item.id === collectionId && item.type === 'folder') {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children) {
          return { ...item, children: addReqToColRecursive(item.children) };
        }
        return item;
      });
    };

    setCollections((prev) => addReqToColRecursive(prev));
    updateTabRequest(activeTab.id, { name });
  };

  const loadRequestIntoTab = (request: ApiRequest) => {
    addTab(request);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const importCurlString = (curl: string): boolean => {
    const parsed = parseCurlCommand(curl);
    if (parsed && parsed.url) {
      addTab({
        ...parsed,
        name: `Imported Request (${parsed.method || 'GET'})`,
      });
      return true;
    }
    return false;
  };

  return (
    <ApiContext.Provider
      value={{
        tabs,
        activeTabId,
        environments,
        collections,
        history,
        activeTab,
        activeEnvironment,
        useProxy,
        setUseProxy,
        setActiveTabId,
        addTab,
        closeTab,
        duplicateTab,
        updateTabRequest,
        sendRequest,
        cancelRequest,
        createEnvironment,
        deleteEnvironment,
        setActiveEnvironment,
        updateEnvironmentVariables,
        createCollection,
        deleteCollectionItem,
        saveCurrentRequestToCollection,
        loadRequestIntoTab,
        clearHistory,
        deleteHistoryItem,
        importCurlString,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
