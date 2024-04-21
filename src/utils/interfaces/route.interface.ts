import { HttpVerbKeys } from "../smartful.utils";

export interface IPrefix {
  path: string;
  description: string;
  class?: string;
}

export interface ISuffix {
  path: string;
  auth: OAuth2;
  method: HttpVerbKeys | string;
  handle: string | symbol;
}

//https://auth0.com/blog/pt-refresh-tokens-what-are-they-and-when-to-use-them/
export enum OAuth2 {
  none,
  bearer,
}
