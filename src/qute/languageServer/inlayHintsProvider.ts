import { CancellationToken, Command, EventEmitter, InlayHint, InlayHintKind, InlayHintLabelPart, InlayHintsProvider, MarkdownString, Range, TextDocument } from "vscode";
import * as ls from 'vscode-languageserver-protocol';
import { LanguageClient, RequestType } from "vscode-languageclient/node";

export class QuteInlayHintsProvider implements InlayHintsProvider {

  private onDidChange = new EventEmitter<void>();
  public onDidChangeInlayHints = this.onDidChange.event;

  constructor(private client: LanguageClient) {
    this.client.onRequest(InlayHintRefreshRequest.type, async () => {
      this.onDidChange.fire();
    });
  }

  public async provideInlayHints(document: TextDocument, range: Range, token: CancellationToken): Promise<InlayHint[]> {
    const requestParams: InlayHintParams = {
      textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(document),
      range: this.client.code2ProtocolConverter.asRange(range)
    };
    try {
      const values = await this.client.sendRequest(InlayHintRequest.type, requestParams, token);
      if (token.isCancellationRequested) {
        return [];
      }
      return asInlayHints(values, this.client);
    } catch (error) {
      return this.client.handleFailedRequest(InlayHintRequest.type, token, error);
    }
  }
}

/**
 * A parameter literal used in inlay hints requests.
 *
 * @since 3.17.0 - proposed state
 */
export type InlayHintParams = /*WorkDoneProgressParams &*/ {
  /**
   * The text document.
   */
  textDocument: ls.TextDocumentIdentifier;

  /**
   * The document range for which inlay hints should be computed.
   */
  range: ls.Range;
};

/**
 * Inlay hint information.
 *
 * @since 3.17.0 - proposed state
 */
export type LSInlayHint = {

  /**
   * The position of this hint.
   */
  position: ls.Position;

  /**
   * The label of this hint. A human readable string or an array of
   * InlayHintLabelPart label parts.
   *
   * *Note* that neither the string nor the label part can be empty.
   */
  label: string | LSInlayHintLabelPart[];
};

export type LSInlayHintLabelPart = {

  /**
   * The value of this label part.
   */
  value: string;

  /**
   * An optional command for this label part.
   *
   * Depending on the client capability `inlayHint.resolveSupport` clients
   * might resolve this property late using the resolve request.
   */
  command?: ls.Command;

  /**
   * The tooltip text when you hover over this label part. Depending on
   * the client capability `inlayHint.resolveSupport` clients might resolve
   * this property late using the resolve request.
   */
  tooltip?: string | ls.MarkupContent;

};

namespace InlayHintRequest {
  export const type: RequestType<InlayHintParams, LSInlayHint[], any> = new RequestType('textDocument/inlayHint');
}

/**
 * @since 3.17.0 - proposed state
 */
namespace InlayHintRefreshRequest {
  export const type: RequestType<void, void, void> = new RequestType('workspace/inlayHint/refresh');
}

async function asInlayHints(values: LSInlayHint[] | undefined | null, client: LanguageClient,): Promise<InlayHint[] | undefined> {
  if (!Array.isArray(values)) {
    return undefined;
  }
  return values.map(lsHint => asInlayHint(lsHint, client));
}

function asInlayHint(item: LSInlayHint, client: LanguageClient): InlayHint {
  const label = typeof item.label === 'string'
    ? item.label
    : item.label.map(asInlayHintLabelPart);
  const result = new InlayHint(client.protocol2CodeConverter.asPosition(item.position), label);
  result.paddingRight = true;
  result.kind = InlayHintKind.Parameter;
  return result;
}

function asInlayHintLabelPart(item: LSInlayHintLabelPart): InlayHintLabelPart {
  const result = new InlayHintLabelPart(item.value);
  if (item.command !== undefined) { result.command = asCommand(item.command); }
  if (item.tooltip !== undefined) { result.tooltip = asTooltip(item.tooltip); }
  return result;
}

function asCommand(item: ls.Command): Command {
  const result = { title: item.title, command: item.command } as Command;
  if (item.arguments) { result.arguments = item.arguments; }
  return result;
}

function asTooltip(value: string | ls.MarkupContent): string | MarkdownString {
  if (typeof value === 'string') {
    return value;
  }
  const result = new MarkdownString(value.value);
  return result;
}
