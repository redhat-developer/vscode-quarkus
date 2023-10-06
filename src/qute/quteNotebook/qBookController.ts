import * as vscode from 'vscode';

export class QBookController {
  readonly id = 'test-notebook-renderer-kernel';
  public readonly label = 'Sample Notebook Kernel';
  readonly supportedLanguages = ['json', 'qute-html', 'qute-yaml', 'qute-json', 'qute-txt'];

  private _executionOrder = 0;
  private readonly _controller: vscode.NotebookController;

  constructor() {

    this._controller = vscode.notebooks.createNotebookController(this.id,
                                                                'qbook',
                                                                this.label);

    this._controller.supportedLanguages = this.supportedLanguages;
    this._controller.supportsExecutionOrder = true;
    this._controller.executeHandler = this._executeAll.bind(this);
  }

  dispose(): void {
		this._controller.dispose();
	}

  private _executeAll(cells: vscode.NotebookCell[], _notebook: vscode.NotebookDocument, _controller: vscode.NotebookController): void {
		for (let cell of cells) {
			this._doExecution(cell);
		}
	}

  private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
    const execution = this._controller.createNotebookCellExecution(cell);

    const previousIndex = cell.index -1;
    const previousCell = cell && cell.notebook.cellAt(previousIndex);
    const data = previousCell && previousCell.document.getText();

    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());

    try {

      const templateContent = cell.document.getText();
      const result : string = await vscode.commands.executeCommand('qute.generate', templateContent, data );

      execution.replaceOutput([new vscode.NotebookCellOutput([
        //vscode.NotebookCellOutputItem.text(cell.document.getText()+ data, "x-application/sample-json-renderer"),
        vscode.NotebookCellOutputItem.text(result)
      ])]);

      execution.end(true, Date.now());
    } catch (err) {
      execution.replaceOutput([new vscode.NotebookCellOutput([
        vscode.NotebookCellOutputItem.error(err)
      ])]);
      execution.end(false, Date.now());
    }
  }
}
