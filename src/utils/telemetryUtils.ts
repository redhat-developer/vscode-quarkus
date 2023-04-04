import { getRedHatService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/";
import { ExtensionContext } from "vscode";

export const CMD_SUCCEED_VALUE = "succeeded";
const CMD_FAIL_VALUE = "failed";

let telemetryService: TelemetryService;
let isTelemetryInit = false;

export async function initTelemetryService(context: ExtensionContext): Promise<void> {
  if (isTelemetryInit) {
    throw new Error('Telemetry already initialized');
  }
  telemetryService = await (await getRedHatService(context)).getTelemetryService();
  telemetryService.sendStartupEvent();
  isTelemetryInit = true;
}

/**
 * Sends a telemetry event indicating that the given command ran successfully
 *
 * @param commandName the command that was executed
 * @throws if the telemetry service has not been initialized yet
 * @returns when the telemetry event has been sent
 */
export async function sendCommandSucceededTelemetry(commandName: string): Promise<void> {
  await sendCommandTelemetry(commandName, true);
}

/**
 * Sends a telemetry event indicating that the given command failed
 *
 * @param commandName the command that was executed
 * @param msg the error message
 * @throws if the telemetry service has not been initialized yet
 * @returns when the telemetry event has been sent
 */
export async function sendCommandFailedTelemetry(commandName: string, msg?: string): Promise<void> {
  await sendCommandTelemetry(commandName, false, msg);
}

/**
 * Send a telemetry event related to a given vscode-quarkus command
 *
 * @param commandName the name of the command that was run
 * @throws if the telemetry service has not been initialized yet
 * @returns when the telemetry event has been sent
 */
async function sendCommandTelemetry(commandName: string, succeeded: boolean, msg?: string): Promise<void> {
  if (!isTelemetryInit) {
    throw new Error('Telemetry has not been initialized yet');
  }
  await telemetryService.send({
    name: commandName,
    properties: {
      status: succeeded ? CMD_SUCCEED_VALUE : CMD_FAIL_VALUE,
      error_message: msg
    }
  });
}

/**
 * Send a telemetry event related to a given vscode-quarkus command
 *
 * @param commandName the name of the command that was run
 * @throws if the telemetry service has not been initialized yet
 * @returns when the telemetry event has been sent
 */
 export async function sendTelemetry(commandName: string, data: any): Promise<void> {
  if (!isTelemetryInit) {
    throw new Error('Telemetry has not been initialized yet');
  }
  await telemetryService.send({
    name: commandName,
    properties: data
  });
}
