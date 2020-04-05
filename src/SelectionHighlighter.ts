import { TextEditor } from 'vscode';

import { Tag, TagIndex, ParseResult } from './types';
import { selectionHighlightDecorationType } from './style';
import { rangeOf } from './utility';
import { getSelectedTagIndexes } from './templateComponentUtility';

export default class SelectionHighlighter {
  public highlight(editor: TextEditor, parseResult: ParseResult) {
    const selections = editor.selections;
    const selectedTagIndexes = getSelectedTagIndexes(parseResult.tags, editor.document, selections);
    const tags = this.getTagsToHighlight(parseResult, selectedTagIndexes);
    editor.setDecorations(
      selectionHighlightDecorationType,
      tags.map(tag => rangeOf(editor.document, tag)),
    );
  }

  private getTagsToHighlight(parseResult: ParseResult, selectedTagIndexes: TagIndex[]): Tag[] {
    const tagIndexes = new Set<TagIndex>();
    for (const selectedTagIndex of selectedTagIndexes) {
      const blocks = parseResult.tagToBlocks.get(selectedTagIndex) || [];
      for (const block of blocks) {
        tagIndexes.add(block.startTagIndex);
        for (const middleTagIndex of block.middleTagIndexes) {
          tagIndexes.add(middleTagIndex);
        }
        tagIndexes.add(block.endTagIndex);
      }
    }
    tagIndexes.delete(-1); // Remove -1 that might have been added if a block is incomplete
    return [...tagIndexes].map(index => parseResult.tags[index]);
  }

  public clear(editor: TextEditor) {
    editor.setDecorations(selectionHighlightDecorationType, []);
  }
}
