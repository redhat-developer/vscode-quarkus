import * as fs from 'fs';
import * as path from 'path';

export namespace FsUtils {

  /**
   * Referenced from https://stackoverflow.com/a/49889780
   * @param fileDir
   * @param str
   */
  export function prependToFile(fileDir: string, str: string) {
    const data = fs.readFileSync(fileDir);
    const fd = fs.openSync(fileDir, 'w+');
    const insert = new Buffer(str);
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.closeSync(fd);
  }

  /**
   * Returns `true` if `second` is a sub directory
   * of `first`. Returns `false` otherwise.
   * @param first
   * @param second
   */
  export function isSubDirectory(first: string, second: string): boolean {
    return path.relative(second, first).startsWith('..');
  }

  /**
   * Returns `true` if `first` and `second` resolve to the
   * same directory. Returns `false` otherwise.
   * @param first
   * @param second
   */
  export function isSameDirectory(first: string, second: string): boolean {
    return path.relative(second, first).length === 0;
  }
}
