import { ThemeColor } from 'vscode';

export type Color = ThemeColor | string;

export type LinearPosition = number;

export type DirectiveType = 'NON_BLOCK_DIRECTIVE'
  | 'BLOCK_START_DIRECTIVE'
  | 'BLOCK_MIDDLE_DIRECTIVE'
  | 'BLOCK_END_DIRECTIVE';
export type TokenType = 'TAG_OPEN'
  | 'TAG_CLOSE'
  | DirectiveType;

export interface Token {
  type: TokenType;
  start: LinearPosition;
  end: LinearPosition; // Not inclusive
  text: string;
}

export interface Directive extends Token {
  type: DirectiveType;
}

export interface Tag {
  start: LinearPosition;
  end: LinearPosition; // Not inclusive
  directives: Directive[];
  contentText: string;
  takesWholeLine: boolean;
}

export type TagIndex = number;

// Since a tag does not correspond to a directive,
// Block needs to remember its constituent directives and tags separately.
export interface Block {
  isRoot: boolean;
  startDirective: Directive | null;
  startTagIndex: TagIndex; // -1 when the tag doesn't exist
  middleDirectives: Directive[];
  middleTagIndexes: TagIndex[];
  endDirective: Directive | null;
  endTagIndex: TagIndex; // -1 when the tag doesn't exist
  children: Block[];
}

export interface ParseResult {
  tags: Tag[],
  tree: Block;
  // A map from tagIndex to the set of blocks to which the tag belong.
  // This map is used for highlighting the corresponding tags of the currently selected tag.
  tagToBlocks: Map<TagIndex, Block[]>;
}
