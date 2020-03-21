import {
  ThemeColor,
  ThemableDecorationAttachmentRenderOptions,
  workspace,
} from 'vscode';

export const depthColors = workspace
  .getConfiguration('templateToolkitTagPair.highlight')
  .get<string[]>('depthColors') || [];
export const incompleteBlockColor = new ThemeColor('templateToolkitTagPair.incompleteBlock');

export const afterTextStyle: ThemableDecorationAttachmentRenderOptions = {
  margin: '0 0 0 3em',
  color: new ThemeColor('templateToolkitTagPair.correspondingDirectiveNextToTag'),
};
