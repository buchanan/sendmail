import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as https from 'https';

export function activate(context: vscode.ExtensionContext) {
	const command = "sendmail.sendEmail";
	const commandHandler = () => {
		const activeEditor = vscode.window.activeTextEditor;
		if ( activeEditor === undefined ) {
			vscode.window.showErrorMessage("No active document");
			return;
		}
		const documentText = activeEditor.document.getText();
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
	const smsHandler = () => {
		const activeEditor = vscode.window.activeTextEditor;
		if ( activeEditor === undefined ) {
			vscode.window.showErrorMessage('No active document');
			return;
		}
		const sendAddr = activeEditor.document.lineAt(0);
		const lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
		const sendBody = activeEditor.document.getText(
			new vscode.Range(
				sendAddr.rangeIncludingLineBreak.end,
				lastLine.range.end
			)
		);
		if ( ! sendAddr.text.match(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/g) ) {
			vscode.window.showErrorMessage('First line is not a valid phone number');
			return;
		}
		const postData = JSON.stringify({
			account_id: vscode.workspace.getConfiguration('sendmail').get('pulseAccountID'),
			to: sendAddr.text,
			message: sendBody,
			sent_device: 0
		});
		const req = https.request({
			hostname: 'api.messenger.klinkerapps.com',
			port: 443,
			path: '/api/v1/messages/forward_to_phone',
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json;charset=UTF-8'
			}
		}, res => {
			if (res.statusCode === 200 ) {
				vscode.window.showInformationMessage('Message sent!');
			} else {
				vscode.window.showErrorMessage(`Message failed to send.\nReceived ${res.statusCode}`);
			}
			console.log(`statusCode: ${res.statusCode}`);
		});
		req.on('error', error => {
			vscode.window.showErrorMessage(`Error: ${error}`);
			console.error(`Error: ${error}`);
		});

		req.write(postData);
		req.end();
	};
	context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));
	context.subscriptions.push(vscode.commands.registerCommand("sendmail.sms", smsHandler));
}

export function deactivate() {}
