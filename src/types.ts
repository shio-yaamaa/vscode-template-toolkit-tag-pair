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
}

// Since the a tag does not correspond to a directive,
// Block needs to remember its constituent directives and tags separately.
export interface Block {
  isRoot: boolean;
  startDirective: Directive | null;
  startTagIndex: number; // -1 when the tag doesn't exist
  middleDirectives: Directive[];
  middleTagIndexes: number[];
  endDirective: Directive | null;
  endTagIndex: number; // -1 when the tag doesn't exist
  children: Block[];
}
