import { ThemeColor } from 'vscode';

export type Color = ThemeColor | string;

export type LinearPosition = number;

export type DirectiveType = 'NON_BLOCK_DIRECTIVE'
  | 'BLOCK_START_DIRECTIVE'
  | 'BLOCK_MIDDLE_DIRECTIVE'
  | 'BLOCK_END_DIRECTIVE';
export type TokenType = 'TAG_OPEN'
  | 'TAG_CLOSE'
  | DirectiveType
  | 'STATEMENT_DELIMITER';

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
  directives: Directive[]; // Only the first directives in each statement
  contentText: string;
  takesWholeLine: boolean;
}

// Only the first directive in a statement (a portion of code separated by semicolons)
// can determine the block structure.
// For example, IF and FILTER start a block when they are the first directive in a statement.
// [% IF true %][% END %], [% FILTER html %][% END %]
// However, when they follow other directives in the same statement,
// they don't affect the structure of the block.
// [% LAST IF true %], [% INCLUDE text FILTER html %]
// Second or later directives in a statement are ignored when constructing Tags.

export type TagIndex = number;

// Since a tag does not correspond to a directive,
// Block needs to remember its constituent directives and tags separately.
export interface Block {
  depth: number; // -1 for the root block (the container of the outermost blocks)
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
  // A map from tagIndex to the set of blocks to which the tag belongs.
  // This map is used for highlighting the corresponding tags of the currently selected tag.
  tagToBlocks: Map<TagIndex, Block[]>;
}
