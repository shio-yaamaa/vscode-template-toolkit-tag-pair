import {
  ThemeColor,
  DecorationRenderOptions,
  DecorationRangeBehavior,
  window,
  workspace,
} from 'vscode';

const depthColors = workspace
  .getConfiguration('templateToolkitTagPair.highlight')
  .get<string[]>('depthColors') || [];
const incompleteBlockColor = new ThemeColor('templateToolkitTagPair.incompleteBlock');

// The common styling for depth and incomplete block highlight
const depthHighlightCommonDecorationOptions: DecorationRenderOptions = {
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  after: {
    margin: '0 0 0 3em',
    color: new ThemeColor('templateToolkitTagPair.correspondingDirectiveNextToTag'),
  },
};

export const depthHighlightDecorationTypes = depthColors.map(color => {
  return window.createTextEditorDecorationType({
    ...depthHighlightCommonDecorationOptions,
    backgroundColor: color,
  });
});

export const incompleteBlockDecorationType = window.createTextEditorDecorationType({
  ...depthHighlightCommonDecorationOptions,
  backgroundColor: incompleteBlockColor,
});

export const selectionHighlightDecorationType = window.createTextEditorDecorationType({
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  borderWidth: '2px',
  borderColor: 'red',
  borderStyle: 'solid',
});
