import { TokenType } from './types';

export type Context = 'OUTSIDE_TAG' | 'IN_TAG';

export interface TokenDefinition {
  pattern: RegExp;
  tokenType?: TokenType; // Undefined when the token is not used in the parsing process
  contextAfter: Context;
}

const directives = {
  nonBlock: [
    'GET', 'CALL', 'SET', 'DEFAULT',
    'INSERT', 'INCLUDE', 'PROCESS', 'USE', 'MACRO',
    'THROW', 'NEXT', 'LAST', 'BREAK', 'RETURN', 'STOP', 'CLEAR',
    'META', 'TAGS', 'DEBUG',
  ],
  blockStart: [
    'WRAPPER', 'BLOCK',
    'IF', 'UNLESS', 'SWITCH', 'FOR', 'FOREACH', 'WHILE',
    'FILTER', 'PERL', 'RAWPERL', 'TRY',
  ],
  blockMiddle: ['ELSIF', 'ELSE', 'CASE', 'CATCH', 'FINAL'],
  blockEnd: ['END'],
};

const fromDirectives = (directives: string[]): RegExp => {
  const anyDirective = directives.map(directive => directive).join('|');
  return new RegExp(`^(${anyDirective})(?=\\W)`); // Directive name followed by a non-word character
};

const tokensOutsideTag: TokenDefinition[] = [
  // Plain text
  {
    pattern: /^((?!\[%)[^])+/, // Anything including line breaks that do not contain an opening tag
    contextAfter: 'OUTSIDE_TAG',
  },
  // Comment tag
  {
    pattern: /^\[%[-+]?#[^]*?%\]/, // Opening tag (+ chomping option) + pound sign
    contextAfter: 'OUTSIDE_TAG',
  },
  // Tag open
  {
    pattern: /^\[%[-+]?\s*(?=$|[^#])/, // Opening tag (+ chomping option) (+ whitespace) - pound sign
    tokenType: 'TAG_OPEN',
    contextAfter: 'IN_TAG',
  },
];

const tokensInTag: TokenDefinition[] = [
  // Tag close
  {
    pattern: /^\s*[-+]?%\]/, // Any number of whitespace + (chomping option) + closing tag
    tokenType: 'TAG_CLOSE',
    contextAfter: 'OUTSIDE_TAG',
  },
  // Non-block directives
  {
    pattern: fromDirectives(directives.nonBlock),
    tokenType: 'NON_BLOCK_DIRECTIVE',
    contextAfter: 'IN_TAG',
  },
  // Block-start directives
  {
    pattern: fromDirectives(directives.blockStart),
    tokenType: 'BLOCK_START_DIRECTIVE',
    contextAfter: 'IN_TAG',
  },
  // Block-middle directives
  {
    pattern: fromDirectives(directives.blockMiddle),
    tokenType: 'BLOCK_MIDDLE_DIRECTIVE',
    contextAfter: 'IN_TAG',
  },
  // Block-end directives
  {
    pattern: fromDirectives(directives.blockEnd),
    tokenType: 'BLOCK_END_DIRECTIVE',
    contextAfter: 'IN_TAG',
  },
  // Statement delimiter
  {
    pattern: /^\s*;\s*/, // Semicolon preceded by or followed by any number of whitespace
    contextAfter: 'IN_TAG',
  },
  // String literal
  {
    pattern: /^(\"[^]*?\"|\'[^]*?\')/, // Anything including line breaks enclosed in "" or ''
    contextAfter: 'IN_TAG',
  },
  // Line comment
  {
    pattern: /^#.*?(?=(\n|%\]))/, // Pound sign + anything until a line break or a closing tag
    contextAfter: 'IN_TAG',
  },
  // Code in tag
  {
    pattern: /^[^]+?(?="|'|#|%]|;)/, // Anything including line breaks until a string literal, line comment, tag close, or statement delimiter
    contextAfter: 'IN_TAG',
  }
];

// Only the first directive in a statement (a portion of code separated by semicolons)
// can determine the block structure.
// For example, IF and FILTER start a block when they are the first directive in a statement.
// [% IF true %][% END %], [% FILTER html %][% END %]
// However, when they follow other directives in the same statement,
// they don't affect the structure of the block.
// [% LAST IF true %], [% INCLUDE text FILTER html %]
// Second or later directives in a statement are ignored by this parser
// as they are recognized as part of "code in tag" /[^]+?(?="|'|#|%]|;)/

export const tokens = {
  'OUTSIDE_TAG': tokensOutsideTag,
  'IN_TAG': tokensInTag,
};

export const stripTag = (tagText: string): string => {
  return tagText
    .replace(/^\[%[+-]?\s*/, '')
    .replace(/\s*[+-]?%]$/, '');
};
