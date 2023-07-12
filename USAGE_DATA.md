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
       * The list of Quarkus extensions selected
    * "Quarkus: Debug current Quarkus project"
    * "Quarkus: Deploy current Quarkus project to OpenShift (odo)"
    * "Quarkus: Generate a Quarkus project"
       * The project type (eg. Maven, Gradle, etc.)
       * Whether sample code is to be included
       * The list of Quarkus extensions selected
    * "Quarkus: Welcome"
    * "Quarkus: Build executable"
 * vscode-quarkus emits telemetry when a recommendation to install a 3rd party extension is proposed.
   The telemetry contains the extension name and the choice made.

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.
Note that this extension abides by Visual Studio Code's telemetry level: if `telemetry.telemetryLevel` is set to off, then no telemetry events will be sent to Red Hat, even if `redhat.telemetry.enabled` is set to true. If `telemetry.telemetryLevel` is set to `error` or `crash`, only events containing an error or errors property will be sent to Red Hat.
