import { ExtensionContext, window, workspace } from 'vscode';

import Scheduler from './Scheduler';
import Parser from './Parser';
import TreeBuilder from './TreeBuilder';
import Highlighter from './Highlighter';
import { checkLanguage } from './utility';

export function activate(context: ExtensionContext) {
	const scheduler = new Scheduler(100);
	const parser = new Parser();
	const treeBuilder = new TreeBuilder();
	const highlighter = new Highlighter();

	window.onDidChangeActiveTextEditor(editor => {
		parseAndHighlight(scheduler, parser, treeBuilder, highlighter);
  }, null, context.subscriptions);

	workspace.onDidChangeTextDocument(_event => {
		parseAndHighlight(scheduler, parser, treeBuilder, highlighter);
	}, null, context.subscriptions);
}

const parseAndHighlight = (scheduler: Scheduler, parser: Parser, treeBuilder: TreeBuilder, highlighter: Highlighter) => {
	const editor = window.activeTextEditor;
	if (editor && checkLanguage(editor.document)) {
		scheduler.schedule(() => {
			try {
				const tags = parser.parse(editor.document.getText());
				const tree = treeBuilder.build(tags);
				highlighter.highlight(editor, tags, tree);
			} catch (error) {
				console.error(error.message);
			}
		});
	}
};

export function deactivate() {}
