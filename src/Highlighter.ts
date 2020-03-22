import { TextEditor, TextDocument, Range } from 'vscode';

import { Color, Directive, Tag, Block } from './types';
import { depthColors, incompleteBlockColor, afterTextStyle } from './style';
import Decoration from './Decoration';
import { isBlockComplete } from './utility';

const getRangeOf = (document: TextDocument, item: Tag | Directive) => {
  return new Range(
    document.positionAt(item.start),
    document.positionAt(item.end),
  );
};

export default class Highlighter {
  private colors: Color[];
  private decoration: Decoration;

  constructor() {
    this.colors = [...depthColors, incompleteBlockColor];
    this.decoration = new Decoration(this.colors, afterTextStyle);
  }

  public highlight(editor: TextEditor, tags: Tag[], tree: Block) {
    this.registerBlockDecoration(editor.document, this.decoration, tags, tree, -1); // Root block is at depth -1 because it's the container of the outermost blocks
    this.decoration.apply(editor);
  }

  private registerBlockDecoration(document: TextDocument, decoration: Decoration, tags: Tag[], block: Block, depth: number) {
    const colorIndex = isBlockComplete(block)
      ? depth % depthColors.length
      : depthColors.length;
    const startTagContentText = block.startTagIndex >= 0
      ? tags[block.startTagIndex].contentText
      : undefined;

    // Start directive/tag
    if (block.startTagIndex >= 0) {
      decoration.addDecoration(colorIndex, getRangeOf(document, tags[block.startTagIndex]), {});
    }
    // Middle directive/tag
    for (const tagIndex of block.middleTagIndexes) {
      decoration.addDecoration(
        colorIndex,
        getRangeOf(document, tags[tagIndex]),
        {
          hover: startTagContentText,
          after: tags[tagIndex].takesWholeLine ? startTagContentText : undefined,
        },
      );
    }
    // End directive/tag
    if (block.endTagIndex >= 0) {
      decoration.addDecoration(
        colorIndex,
        getRangeOf(document, tags[block.endTagIndex]),
        {
          hover: startTagContentText,
          after: tags[block.endTagIndex].takesWholeLine ? startTagContentText: undefined,
        },
      );
    }

    for (const child of block.children) {
      this.registerBlockDecoration(document, decoration, tags, child, depth + 1);
    }
  }
}
