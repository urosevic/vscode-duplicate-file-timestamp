const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.duplicateFileTimestamp', async () => {
        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor || !activeEditor.document.fileName) {
            vscode.window.showErrorMessage('No active file to duplicate.');
            return;
        }

        const currentFile = activeEditor.document.fileName;
        const dir = path.dirname(currentFile);
        const ext = path.extname(currentFile);
        const base = path.basename(currentFile, ext);

        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace('T', '_').replace(/[-:]/g, '');
		
		// Define new file name pattern.
		const defaultFileName = `${base}.${timestamp}${ext}`;
		
		const userInput = await vscode.window.showInputBox({
			prompt: 'Duplicate file name:',
			value: defaultFileName,
			valueSelection: [base.length + 1, base.length + 1 + timestamp.length] // With selected the timestamp portion.
		});
		
		if (undefined === userInput) {
			vscode.window.showInformationMessage('Duplicate operation cancelled.');
			return;
		}
		
		if ('' === userInput.trim()) {
			vscode.window.showErrorMessage('Duplicate file name is required. Try again.');
			return;
		}
		
		// Prepare full path with file name for the new file.
        const newFilePath = path.join(dir, userInput);
		
		try {
			fs.copyFileSync(currentFile, newFilePath);
			const duplicatedFileName = path.basename(newFilePath);
			vscode.window.showInformationMessage(`Created duplicate file: ${duplicatedFileName}`);
		} catch (error) {
			vscode.window.showErrorMessage(`Error duplicating file: ${error.message}`);
		}

    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
