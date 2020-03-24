import { TextDocument, Selection } from 'vscode';

import { Tag, TagIndex, Block } from './types';
import { setOrAddMapValue, rangeOf } from './utility';

export const getSelectedTagIndexes = (tags: Tag[], document: TextDocument, selections: readonly Selection[]): TagIndex[] => {
  if (selections.length === 0) return [];
  const selection = selections[0];
  const indexes: TagIndex[] = [];
  for (let i = 0; i < tags.length; i++) {
    const tagRange = rangeOf(document, tags[i]);
    const intersection = selection.intersection(tagRange);
    if (intersection) {
      indexes.push(i);
    }
  }
  return indexes;
};

export const createEmptyBlock = (depth: number): Block => {
  return {
    depth,
    startDirective: null,
    startTagIndex: -1,
    middleDirectives: [],
    middleTagIndexes: [],
    endDirective: null,
    endTagIndex: -1,
    children: [],
  };
};

export const isBlockComplete = (block: Block): boolean => {
  return !!(block.startDirective && block.endDirective);
};

// Returns the block's constituent tagIndexes without duplicate
const getTagIndexesOfBlock = (block: Block): TagIndex[] => {
  const tagIndexes: TagIndex[] = [
    block.startTagIndex,
    ...block.middleTagIndexes,
    block.endTagIndex
  ];
  const validTagIndexes = tagIndexes.filter(index => index >= 0);
  return [...new Set(validTagIndexes)];
};

export const mapTagToBlocks = (root: Block): Map<TagIndex, Block[]> => {
  const map = new Map<TagIndex, Block[]>();
  const addMatchingTagsOfBlock = (block: Block) => {
    for (const tagIndex of getTagIndexesOfBlock(block)) {
      setOrAddMapValue<TagIndex, Block>(map, tagIndex, block);
    }
    for (const child of block.children) {
      addMatchingTagsOfBlock(child);
    }
  };
  addMatchingTagsOfBlock(root);
  return map;
};
