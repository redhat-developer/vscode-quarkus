import * as vscode from 'vscode';

interface ResponsePromise {
    method: string;
    timerStart: number;
}

enum Trace {
    Off, Messages, Verbose
}

namespace Trace {
    export function fromString(value: string): Trace {
        switch (value.toLowerCase()) {
            case 'off': return Trace.Off;
            case 'messages': return Trace.Messages;
            case 'verbose': return Trace.Verbose;
            default: return Trace.Off;
        }
    }
}

let trace = Trace.Off;
let outputChannel: vscode.LogOutputChannel | null = null;
const responsePromises: Map<string | number, ResponsePromise> = new Map();

export class QuteDebugAdapterTrackerFactory implements vscode.DebugAdapterTrackerFactory {

    constructor() {
        // Watch configuration changes to update trace dynamically
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration("qute.trace.debug")) {
                updateTraceLevel();
            }
        });
    }

    createDebugAdapterTracker(session: vscode.DebugSession): vscode.DebugAdapterTracker {
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel("Qute Debug", { log: true });
            updateTraceLevel(true);
        }

        outputChannel.info(`Debug session started for ${session.name}`);

        return {
            onWillReceiveMessage: (message) => {
                if (message.type === 'request') {
                    responsePromises.set(message.seq, { method: message.command, timerStart: Date.now() });
                    traceSendingRequest(message);
                }
            },

            onDidSendMessage: (message) => {
                if (message.type === 'response') {
                    handleResponse(message);
                } else if (message.type === 'event') {
                    traceReceivedNotification(message);
                }
            },

            onWillStopSession: () => {
                outputChannel!.info(`Debug session stopped`);
            },

            onError: (error) => {
                outputChannel!.error(`Error: ${error.message}`);
            },

            onExit: (code, signal) => {
                outputChannel!.info(`Exited with code=${code} signal=${signal}`);
            }
        };
    }
}

/**
 * Update trace level from current settings.
 */
function updateTraceLevel(init = false) {
    const config = vscode.workspace.getConfiguration("qute");
    const traceSetting = config.get<string>("trace.debug", "off")!;
    trace = Trace.fromString(traceSetting);

    if (outputChannel) {
        if (init) {
            outputChannel.info(`Trace enabled at level: ${Trace[trace]} (${traceSetting})`);
        } else {
            outputChannel.info(`Trace level updated to: ${Trace[trace]} (${traceSetting})`);
        }
    }
}

function traceSendingRequest(message: any) {
    if (trace === Trace.Off) return;

    let data: string | undefined = undefined;
    if (trace === Trace.Verbose && message.arguments) {
        data = `Params: ${stringifyTrace(message.arguments)}`;
    }
    showTrace(`Sending request '${message.command} - (${message.seq})'.`, data);
}

function traceReceivedNotification(message: any): void {
    if (trace === Trace.Off) return;

    let data: string | undefined = undefined;
    if (trace === Trace.Verbose) {
        data =  message.body
        ? `Params: ${stringifyTrace(message.body)}`
        : 'No parameters provided.';
    }
    showTrace(`Received notification '${message.event}'.`, data);
}

function handleResponse(message: any) {
    if (message.request_seq === null) {
        if (message.error) {
            showError(`Received response message without id: Error is: \n${JSON.stringify(message.error, undefined, 4)}`);
        } else {
            showError(`Received response message without id. No further error information provided.`);
        }
        return;
    }

    const responsePromise = responsePromises.get(message.request_seq);
    traceReceivedResponse(message, responsePromise);

    if (responsePromise) {
        responsePromises.delete(message.request_seq);
    }
}

function traceReceivedResponse(message: any, responsePromise: ResponsePromise | undefined): void {
    if (trace === Trace.Off) return;

    let data: string | undefined = undefined;
    if (trace === Trace.Verbose) {
        if (message.error && message.error.data) {
            data = `Error data: ${stringifyTrace(message.error.data)}`;
        } else if (message.body) {
            data = `Result: ${stringifyTrace(message.body)}`;
        } else if (message.error === undefined) {
            data = 'No result returned.';
        }
    }

    if (responsePromise) {
        const error = message.error
            ? ` Request failed: ${message.error.message} (${message.error.code}).`
            : '';
        showTrace(
            `Received response '${responsePromise.method} - (${message.request_seq})' in ${Date.now() - responsePromise.timerStart}ms.${error}`,
            data
        );
    } else {
        showTrace(`Received response ${message.request_seq} without active response promise.`, data);
    }
}

function stringifyTrace(params: any): string | undefined {
    if (params === undefined || params === null) return undefined;

    switch (trace) {
        case Trace.Verbose:
            return JSON.stringify(params, null, 4);
        case Trace.Messages:
            return JSON.stringify(params);
        default:
            return undefined;
    }
}

function showTrace(message: string, data?: any | undefined): void {
    outputChannel!.trace(getLogMessage(message, data));
}

function showError(message: string): void {
    outputChannel!.error(message);
}

function getLogMessage(message: string, data?: any | undefined): string {
    return data ? `${message}\n${data}` : message;
}
