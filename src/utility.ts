import { TextDocument, Range, window } from 'vscode';

import config from './Config';

interface ItemWithRange {
  start: number;
  end: number;
}

export const setOrAddMapValue = <K, V>(map: Map<K, V[]>, key: K, item: V) => {
  const value = map.get(key);
  if (value) {
    value.push(item);
  } else {
    map.set(key, [item]);
  }
};

export const checkLanguage = (document: TextDocument): boolean => {
  const configLanguages = config.general.languages || [];
  return configLanguages.indexOf(document.languageId) >= 0;
};

export const isDocumentOfCurrentActiveEditor = (document: TextDocument): boolean => {
  const editor = window.activeTextEditor;
  if (!editor) return false;
  const currentDocument = editor.document;
  return currentDocument.uri === document.uri;
};

export const rangeOf = (document: TextDocument, item: ItemWithRange) => {
  return new Range(
    document.positionAt(item.start),
    document.positionAt(item.end),
  );
};

export const verticalDistanceBetween = (document: TextDocument, item1: ItemWithRange, item2: ItemWithRange): number => {
  const start1 = document.positionAt(item1.start);
  const start2 = document.positionAt(item2.start);
  const end1 = document.positionAt(item1.end);
  const end2 = document.positionAt(item2.end);
  return Math.min(Math.abs(start1.line - end2.line), Math.abs(start2.line - end1.line));
};
