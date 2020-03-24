import { workspace } from 'vscode';

const extensionNamespace = 'templateToolkitTagPair';

export default {
  general: {
    languages: workspace
      .getConfiguration(`${extensionNamespace}.general`)
      .get<string[]>('languages'),
  },
  highlight: {
    depthColors: workspace
      .getConfiguration(`${extensionNamespace}.highlight`)
      .get<string[]>('depthColors'),
  },
  correspondingDirective: {
    showOnHover: workspace
      .getConfiguration(`${extensionNamespace}.correspondingDirective`)
      .get<boolean>('showOnHover'),
    showNextToTag: workspace
      .getConfiguration(`${extensionNamespace}.correspondingDirective`)
      .get<'whenPossible' | 'whenDistant' | 'never'>('showNextToTag'),
  },
};
