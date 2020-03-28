import {
  ExtensionContext,
  Disposable,
  TextDocument,
  TextEditor,
  window,
  workspace,
} from 'vscode';

import { ParseResult } from './types';
import Parser from './Parser';
import Scheduler from './Scheduler';
import DepthHighlighter from './DepthHighlighter';
import SelectionHighlighter from './SelectionHighlighter';
import { checkLanguage } from './utility';

export function activate(context: ExtensionContext) {
  let parseResult: ParseResult | null = null;
  const parser = new Parser();
  const parseAndHighlightScheduler = new Scheduler(100);
  const selectionHighlightScheduler = new Scheduler(100);
  const depthHighlighter = new DepthHighlighter();
  const selectionHighlighter = new SelectionHighlighter();
  let documentChangeListener: Disposable | null = null;
  let selectionChangeListener: Disposable | null = null;

  const initializeHighlight = () => {
    const editor = window.activeTextEditor;
    if (!editor) return;
    const isActiveLanguage = checkLanguage(editor.document);
    scheduleParseAndHighlight(isActiveLanguage, editor);
  };

  const setupListeners = () => {
    window.onDidChangeActiveTextEditor(editor => {
      if (!editor) return;
      const isActiveLanguage = checkLanguage(editor.document);
      scheduleParseAndHighlight(isActiveLanguage, editor);
      toggleListeners(isActiveLanguage);
    }, null, context.subscriptions);

    // An event that is emitted when a text document is opened
    // or when the language id of a text document has been changed.
    // The event is emitted before the document is updated in the active text editor.
    workspace.onDidOpenTextDocument(document => {
      const isActiveLanguage = checkLanguage(document);
      scheduleParseAndHighlight(isActiveLanguage, undefined, document);
      toggleListeners(isActiveLanguage);
    }, null, context.subscriptions);

    if (window.activeTextEditor?.document) {
      toggleListeners(checkLanguage(window.activeTextEditor.document));
    }
  };

  const toggleListeners = (shouldActivate: boolean) => {
    if (shouldActivate) {
      if (!documentChangeListener) {
        documentChangeListener = workspace.onDidChangeTextDocument(event => {
          if (event.contentChanges.length === 0) return;
          scheduleParseAndHighlight(true, undefined, event.document);
        }, null, context.subscriptions);
      }
      if (!selectionChangeListener) {
        selectionChangeListener = window.onDidChangeTextEditorSelection(event => {
          scheduleSelectionHighlight(event.textEditor);
        });
      }
    } else {
      documentChangeListener?.dispose();
      selectionChangeListener?.dispose();
      documentChangeListener = null;
      selectionChangeListener = null;
    }
  };

  const scheduleParseAndHighlight = (isActiveLanguage: boolean, editor?: TextEditor, document?: TextDocument) => {
    const currentEditor = editor || window.activeTextEditor;
    if (!currentEditor) return;
    const currentDocument = document || currentEditor.document;
    parseAndHighlightScheduler.schedule(() => {
      parseResult = isActiveLanguage
        ? parser.parse(currentDocument.getText())
        : null;
      if (parseResult) { // If isActiveLanguage and parsing succeeded
        depthHighlighter.highlight(currentEditor, parseResult);
        selectionHighlighter.highlight(currentEditor, parseResult);
      } else {
        depthHighlighter.clear(currentEditor);
        selectionHighlighter.clear(currentEditor);
      }
    });
  };

  const scheduleSelectionHighlight = (editor?: TextEditor) => {
    const currentEditor = editor || window.activeTextEditor;
    if (!currentEditor) return;
    selectionHighlightScheduler.schedule(() => {
      if (!parseResult) return;
      selectionHighlighter.highlight(currentEditor, parseResult);
    });
  };

  initializeHighlight();
  setupListeners();
}

export function deactivate() {}
