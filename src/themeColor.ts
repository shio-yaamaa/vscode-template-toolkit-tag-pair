import { ThemeColor } from 'vscode';

const extensionNamespace = 'templateToolkitTagPair';

export default {
  correspondingDirectiveNextToTag: new ThemeColor(`${extensionNamespace}.correspondingDirectiveNextToTag`),
  incompleteBlock: new ThemeColor(`${extensionNamespace}.incompleteBlock`),
  selectedBlock: new ThemeColor(`${extensionNamespace}.selectedBlock`),
  selectedBlockBorder: new ThemeColor(`${extensionNamespace}.selectedBlockBorder`),
};
