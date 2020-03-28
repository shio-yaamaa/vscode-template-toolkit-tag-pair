import {
  DecorationRenderOptions,
  DecorationRangeBehavior,
  window,
} from 'vscode';

import config from './Config';
import themeColor from './themeColor';

// The common styling for depth and incomplete block highlight
const depthHighlightCommonDecorationOptions: DecorationRenderOptions = {
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  after: {
    margin: '0 0 0 3em',
    color: themeColor.correspondingDirectiveNextToTag,
  },
};

const depthColors = config.highlight.depthColors || [];
if (depthColors.length === 0) {
  depthColors.push('#00000000'); // Add a transparent color
}

export const depthHighlightDecorationTypes = depthColors.map(color => {
  return window.createTextEditorDecorationType({
    ...depthHighlightCommonDecorationOptions,
    backgroundColor: color,
  });
});

export const incompleteBlockDecorationType = window.createTextEditorDecorationType({
  ...depthHighlightCommonDecorationOptions,
  backgroundColor: themeColor.incompleteBlock,
});

export const selectionHighlightDecorationType = window.createTextEditorDecorationType({
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  backgroundColor: themeColor.selectedBlock,
  borderWidth: '1px',
  borderColor: themeColor.selectedBlockBorder,
  borderStyle: 'solid',
});
