import { ExtensionContext, window, workspace } from 'vscode';

import { ParseResult } from './types';
import Scheduler from './Scheduler';
import Parser from './Parser';
import TreeBuilder from './TreeBuilder';
import DepthHighlighter from './DepthHighlighter';
import SelectionHighlighter from './SelectionHighlighter';
import { checkLanguage, mapTagToBlocks } from './utility';

let parseResult: ParseResult | null = null;

export function activate(context: ExtensionContext) {
  const scheduler = new Scheduler(100);
  const parser = new Parser();
  const treeBuilder = new TreeBuilder();
  const depthHighlighter = new DepthHighlighter();
  const selectionHighlighter = new SelectionHighlighter();

  window.onDidChangeActiveTextEditor(_editor => {
    parseAndHighlight(scheduler, parser, treeBuilder, depthHighlighter, selectionHighlighter);
  }, null, context.subscriptions);

  workspace.onDidChangeTextDocument(_event => {
    parseAndHighlight(scheduler, parser, treeBuilder, depthHighlighter, selectionHighlighter);
  }, null, context.subscriptions);

  window.onDidChangeTextEditorSelection(event => {
    if (!parseResult) return;
    const editor = window.activeTextEditor;
    if (editor && checkLanguage(editor.document)) {
      selectionHighlighter.highlight(editor, event.selections, parseResult);
    }
  });

  parseAndHighlight(scheduler, parser, treeBuilder, depthHighlighter, selectionHighlighter);
}

const parseAndHighlight = (scheduler: Scheduler, parser: Parser, treeBuilder: TreeBuilder, depthHighlighter: DepthHighlighter, selectionHighlighter: SelectionHighlighter) => {
  const editor = window.activeTextEditor;
  if (editor && checkLanguage(editor.document)) {
    scheduler.schedule(() => {
      try {
        const tags = parser.parse(editor.document.getText());
        const tree = treeBuilder.build(tags);
        const tagToBlocks = mapTagToBlocks(tree);
        parseResult = { tags, tree, tagToBlocks };
        depthHighlighter.highlight(editor, parseResult);
        selectionHighlighter.highlight(editor, editor.selections, parseResult);
      } catch (error) {
        // Fail silently because parsing errors are expected to occur
        // when the current template file is work in progress.
      }
    });
  }
};

export function deactivate() {}
