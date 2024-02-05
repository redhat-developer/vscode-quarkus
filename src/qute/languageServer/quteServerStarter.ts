import * as os from 'os';
import * as path from 'path';
import { workspace } from 'vscode';
import { Executable, ExecutableOptions } from 'vscode-languageclient/node';
import { RequirementsData } from './requirements';
import { glob } from 'glob';

const DEBUG = startedInDebugMode();
const DEBUG_PORT = 1074;
const QUTE_SERVER_NAME = 'com.redhat.qute.ls-uber.jar';
const QUTE_SERVER_MAIN_CLASS = 'com.redhat.qute.ls.QuteServerLauncher';

export function prepareExecutable(requirements: RequirementsData): Executable {
  const executable: Executable = Object.create(null);
  const options: ExecutableOptions = Object.create(null);
  options.env = process.env;
  executable.options = options;
  executable.command = path.resolve(requirements.tooling_jre + '/bin/java');
  executable.args = prepareParams();
  return executable;
}

function prepareParams(): string[] {
  const params: string[] = [];
  if (DEBUG) {
    if (process.env.SUSPEND_SERVER === 'true') {
      params.push(`-agentlib:jdwp=transport=dt_socket,server=y,address=${DEBUG_PORT}`);
    } else {
      params.push(`-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${DEBUG_PORT},quiet=y`);
    }
  }

  const vmargs = workspace.getConfiguration("qute").get("server.vmargs", '');
  if (os.platform() === 'win32') {
    const watchParentProcess = '-DwatchParentProcess=';
    if (vmargs.indexOf(watchParentProcess) < 0) {
      params.push(watchParentProcess + 'false');
    }
  }
  // Disable logging unless the user specifically sets it to a different value.
  // Logging can cause issues, since sometimes it writes to standard out.
  // See https://github.com/redhat-developer/vscode-java/issues/2577.
  if (vmargs.indexOf("-Xlog:") < 0) {
    params.push("-Xlog:disable");
  }
  parseVMargs(params, vmargs);
  const serverHome: string = path.resolve(__dirname, '../server');
  const quteServerFound: Array<string> = glob.sync(`**/${QUTE_SERVER_NAME}`, { cwd: serverHome });
  if (quteServerFound.length) {
    const classPath = quteServerFound[0];
    params.push('-cp');
    params.push(`${serverHome}/` + classPath);
    params.push(QUTE_SERVER_MAIN_CLASS);
  } else {
    throw new Error('Unable to find required Language Server JARs');
  }
  return params;
}

function hasDebugFlag(args: string[]): boolean {
  if (args) {
    // See https://nodejs.org/en/docs/guides/debugging-getting-started/
    return args.some(arg => /^--inspect/.test(arg) || /^--debug/.test(arg));
  }
  return false;
}

function startedInDebugMode(): boolean {
  const args: string[] = process.execArgv;
  return hasDebugFlag(args);
}

// exported for tests
export function parseVMargs(params: string[], vmargsLine: string): void {
  if (!vmargsLine) {
    return;
  }
  const vmargs = vmargsLine.match(/(?:[^\s"]+|"[^"]*")+/g);
  if (vmargs === null) {
    return;
  }
  vmargs.forEach(arg => {
    // remove all standalone double quotes
    arg = arg.replace(/(\\)?"/g, ($0, $1) => { return ($1 ? $0 : ''); });
    // unescape all escaped double quotes
    arg = arg.replace(/(\\)"/g, '"');
    if (params.indexOf(arg) < 0) {
      params.push(arg);
    }
  });
}
