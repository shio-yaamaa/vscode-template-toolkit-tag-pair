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

// FILTER directive is, when used in isolation, a block-starting directive.
// It can also follow various other non-block directives like INCLUDE.
// This extension cannot distinguish these two types
// and treats every instance of FILTER as block-starting.

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
    pattern: /^\[%((?=[^-+#])|[-+](?=[^#]))/, // Opening tag (+ chomping option) - pound sign
    tokenType: 'TAG_OPEN',
    contextAfter: 'IN_TAG',
  },
];

const tokensInTag: TokenDefinition[] = [
  // Tag close
  {
    pattern: /^[-+]?%\]/, // (Chomping option) + closing tag
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
  // Directive delimiter
  {
    pattern: /^(\s|;)+/, // Sequence of whitespace or semicolons
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
    pattern: /^[^]+?(?="|'|#|%]|\s|;)/, // Anything including line breaks until a string literal, line comment, tag close, or directive delimiter
    contextAfter: 'IN_TAG',
  }
];

// The characters in the directive delimiter are the ones that can be followed by a directive.
// When a directive delimiter appears in a tag,
// 1. "Code in tag" stops matching
// 2. Directive delimiter matches
// 3. Directives are checked for a match
// 4. If none of the directives matches, "code in tag" matches again in the next iteration
// Example: [% SET a = 1; SET b = 2 %]

export const tokens = {
  'OUTSIDE_TAG': tokensOutsideTag,
  'IN_TAG': tokensInTag,
};

export const stripTag = (tagText: string): string => {
  return tagText
    .replace(/^\[%[+-]?\s*/, '')
    .replace(/\s*[+-]?%]$/, '');
};
