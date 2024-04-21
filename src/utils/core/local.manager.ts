import * as fs from 'fs';
import * as path from 'path';

/**
 * Singleton
 */
export class LocalManager {

    private static _instance: LocalManager;

    private static _locale: Array<any> = Array<any>();

    private static _path: string = '';

    private constructor(locale: any, path: string) {
      LocalManager._locale = locale;
      LocalManager._path = path;
    }

    get path(): string {
      return LocalManager._path; 
    }

    static getLocale(i18n: string): string {
      const locale: Array<any> = LocalManager._locale.filter((item) => item[i18n]);
      let text = '{}';

      if(locale != null && locale.length != 0) {
          text = locale[0][i18n];
      }

      return text;
    }

    static setLocale(i18n: string, data: any): void {
      const file = JSON.stringify(data, null, 4);
      const i18nPath: string = path.join(LocalManager._path, i18n);
      const filePath: string = `${i18nPath}\/resource.${i18n}.local.json`;

      if(!fs.existsSync(i18nPath)) {
        fs.mkdirSync(i18nPath);
      }

      fs.writeFile(filePath, file, 'utf8', LocalManager.i18nSaveError);
    }

    private static i18nSaveError (err: any) {
      if (err) {
        console.log(`An error occured while writing Object to File.`);
        return console.log(err);
      }
      console.log(`File file has been saved.`);
    }

    static create(locale: Array<any>, path: string): LocalManager {

      if (!LocalManager._instance) {
        LocalManager._instance = new LocalManager(locale, path);
      }

      return LocalManager._instance;
    }

}

/**
 * Alias for LocalManager
 */
export const lmn = LocalManager;