# USAGE DATA

vscode-quarkus has opt-in telemetry collection, provided by [vscode-redhat-telemetry](https://github.com/redhat-developer/vscode-redhat-telemetry).

## What's included in the vscode-quarkus telemetry data

 * vscode-quarkus emits telemetry events when the extension starts and stops,
   which contain the common data mentioned on the
   [vscode-redhat-telemetry page](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/master/USAGE_DATA.md#common-data).
 * vscode-quarkus emits telemetry events when a vscode-quarkus command runs successfully or fails.
   The telemetry event contains the name of the command that is run, and whether it was a success or failure.
   If the command fails, it also contains the error message, with any usernames and paths removed from the error message.
   The following commands emit these telemetry events:
    * "Quarkus: Add extensions to current project"
    * "Quarkus: Debug current Quarkus project"
    * "Quarkus: Generate a Quarkus project"
    * "Quarkus: Welcome"

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.
