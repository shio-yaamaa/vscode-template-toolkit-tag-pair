import { TextDocument, workspace } from 'vscode';
import { Block } from './types';

export const checkLanguage = (document: TextDocument): boolean => {
  const languages = workspace
    .getConfiguration('templateToolkitTagPair.general')
    .get<string[]>('languages') || [];
  return languages.indexOf(document.languageId) >= 0;
};

export const isBlockComplete = (block: Block): boolean => {
  return !!(block.startDirective && block.endDirective);
};
