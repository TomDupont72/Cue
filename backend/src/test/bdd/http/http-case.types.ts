import type { InjectOptions } from "fastify";

export const HTTP_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type RawHttpCase = Readonly<Record<string, string>>;

export type HttpContractRequest = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  payload?: InjectOptions["payload"];
};

export type HttpContractCase = {
  state?: string;

  request: HttpContractRequest;

  expectedStatus: number;
  responseFixture: string;
};
