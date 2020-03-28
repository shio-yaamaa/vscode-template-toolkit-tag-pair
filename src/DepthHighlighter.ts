import {
  DecorationOptions,
  TextEditor,
  TextDocument,
  TextEditorDecorationType,
  ThemableDecorationAttachmentRenderOptions,
  MarkdownString,
} from 'vscode';

import { Tag, TagIndex, Block, ParseResult } from './types';
import config from './config';
import { depthHighlightDecorationTypes, incompleteBlockDecorationType } from './style';
import DecorationAggregator, { DecorationGroupId } from './DecorationAggregator';
import { rangeOf, verticalDistanceBetween } from './utility';
import { isBlockComplete } from './templateComponentUtility';

const incompleteBlockGroupId = 'incomplete';
const minDistanceForAfterElement = 10;

export default class DepthHighlighter {
  private aggregator: DecorationAggregator;

  constructor() {
    this.aggregator = new DecorationAggregator(
      new Map<DecorationGroupId, TextEditorDecorationType>([
        ...depthHighlightDecorationTypes.map((type, index) => {
          return [index, type] as [DecorationGroupId, TextEditorDecorationType];
        }),
        [incompleteBlockGroupId, incompleteBlockDecorationType],
      ])
    );
  }

  public highlight(editor: TextEditor, parseResult: ParseResult) {
    for (let i = 0; i < parseResult.tags.length; i++) {
      const decorationSettings = this.getTagDecorationSettings(editor.document, parseResult, i);
      if (!decorationSettings) continue;
      this.aggregator.addDecoration( ...decorationSettings);
    }
    this.aggregator.apply(editor);
  }

  // Returns null when the tag should not be decorated
  private getTagDecorationSettings(document: TextDocument, parseResult: ParseResult, tagIndex: TagIndex): [DecorationGroupId, DecorationOptions] | null {
    const blocks = parseResult.tagToBlocks.get(tagIndex) || [];
    if (blocks.length === 0) return null;
    const outermostBlock = blocks.reduce((previous, current) => previous.depth < current.depth ? previous : current);
    const decorationGroupId = this.pickDecorationGroup(blocks, outermostBlock);
    const hoverMessage = this.getHoverMessage(parseResult.tags, tagIndex, outermostBlock);
    const afterElement = this.getAfterElement(document, parseResult.tags, tagIndex, outermostBlock);
    return [
      decorationGroupId,
      {
        range: rangeOf(document, parseResult.tags[tagIndex]),
        renderOptions: {
          after: afterElement,
        },
        hoverMessage,
      }
    ];
  }

  private pickDecorationGroup(blocks: Block[], outermostBlock: Block): DecorationGroupId {
    const isComplete = blocks.every(block => isBlockComplete(block));
    return isComplete
      ? outermostBlock.depth % depthHighlightDecorationTypes.length
      : incompleteBlockGroupId;
  }

  private getHoverMessage(tags: Tag[], tagIndex: TagIndex, outermostBlock: Block): MarkdownString | undefined {
    const configValue = config.correspondingDirective.showOnHover;
    if (!configValue) return undefined;
    if (!this.startDirectiveExistsInSeparateTag(tagIndex, outermostBlock)) return undefined;
    return new MarkdownString(`\`${tags[outermostBlock.startTagIndex!].contentText}\``);
  }

  private getAfterElement(document: TextDocument, tags: Tag[], tagIndex: TagIndex, outermostBlock: Block): ThemableDecorationAttachmentRenderOptions | undefined {
    const configValue = config.correspondingDirective.showNextToTag;
    if (!tags[tagIndex].takesWholeLine) return undefined;
    if (!config || configValue === 'never') return undefined;
    if (!this.startDirectiveExistsInSeparateTag(tagIndex, outermostBlock)) return undefined;
    const verticalDistance = verticalDistanceBetween(
      document,
      tags[outermostBlock.startTagIndex!],
      tags[tagIndex]
    );
    if (configValue === 'whenDistant' && verticalDistance < minDistanceForAfterElement) return undefined;
    return {
      contentText: tags[outermostBlock.startTagIndex!].contentText,
    };
  }

  private startDirectiveExistsInSeparateTag(tagIndex: TagIndex, block: Block): boolean {
    return !!(block.startDirective && block.startTagIndex != tagIndex);
  }

  public clear(editor: TextEditor) {
    this.aggregator.clear(editor);
  }
}
