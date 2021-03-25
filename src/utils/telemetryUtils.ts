import { getTelemetryService, TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";
import { VSCODE_QUARKUS_EXTENSION_NAME } from "../definitions/constants";

const CMD_SUCCEED_VALUE = "succeeded";
const CMD_FAIL_VALUE = "failed";

/**
 * Sends a telemetry event indicating that the given command ran successfully
 *
 * @param commandName the command that was executed
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
 * @returns when the telemetry event has been sent
 */
export async function sendCommandFailedTelemetry(commandName: string, msg?: string): Promise<void> {
  await sendCommandTelemetry(commandName, false, msg);
}

/**
 * Send a telemetry event related to a given vscode-quarkus command
 *
 * @param commandName the name of the command that was run
 * @param suffix the suffix to add to the command to get the event name
 */
async function sendCommandTelemetry(commandName: string, succeeded: boolean, msg?: string) {
  const telemetryService: TelemetryService = await getTelemetryService(VSCODE_QUARKUS_EXTENSION_NAME);
  telemetryService.send({
    name: commandName,
    properties: {
      status: succeeded ? CMD_SUCCEED_VALUE : CMD_FAIL_VALUE,
      error_message: msg
    }
  });
}
