export class TokenSession {

  private static _instance: TokenSession;

  private static _paylod: any;

  private static _bearer?: string;

  private constructor(paylod: any) {
    TokenSession._paylod = paylod;
  }

  static create(paylod: any, bearer?: string): TokenSession {
    if (!TokenSession._instance) {
      TokenSession._bearer = bearer;
      TokenSession._instance = new TokenSession(paylod);
    }

    return TokenSession._instance;
  }

  static get bearer (): string {
    return TokenSession._bearer ?? '';
  }

  static get paylod (): any {
    return TokenSession._paylod;
  }

  static get usercode (): string {
    return TokenSession._paylod.usercode;
  }

  static get username (): string {
    return TokenSession._paylod.username;
  }

  static get langcode (): string {
    return TokenSession._paylod.langcode;
  }

}

export const tks = TokenSession;