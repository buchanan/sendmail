import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	const command = "sendmail.sendEmail";
	const commandHandler = () => {
		const documentText = vscode.window.activeTextEditor.document.getText();
		const emailCommand = `echo "${documentText}" | sendmail -vt`;
		cp.exec(emailCommand, (error, _stdout, stderr) => {
			if (error) {
				let errorMessage = `Error: ${stderr}`;
				vscode.window.showErrorMessage(errorMessage);
				console.error(`Error: ${error}`);
				return;
			}

			vscode.window.showInformationMessage('Email sent!');
		});
	};

	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
}

export function deactivate() {}
