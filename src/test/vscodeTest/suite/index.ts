import { glob } from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    useColors: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return glob('**/**.test.js', { cwd: testsRoot })
    .then(files => {
      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      return new Promise((resolve, reject) => {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      });
    });

}
