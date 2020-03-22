import { LinearPosition, Token, Directive, Tag } from './types';
import { Context, TokenDefinition, tokens, stripTag } from './syntax';

interface MatchResult {
  length: number;
  token?: Token;
  context: Context;
}

class Tokenizer {
  public tokenize(text: string): Token[] {
    let remainingText = text;
    let offset: LinearPosition = 0;
    let context: Context = 'OUTSIDE_TAG';
    let tokens: Token[] = [];

    while (remainingText.length > 0) {
      const matchResult = this.matchPossibleTokens(remainingText, offset, context);
      if (matchResult.length === 0) {
        throw new Error('Could not parse the template');
      }
      remainingText = remainingText.slice(matchResult.length);
      offset += matchResult.length;
      context = matchResult.context;
      matchResult.token && tokens.push(matchResult.token);
    }

    if (context === 'IN_TAG') {
      throw new Error('Tags do not match');
    }

    return tokens;
  }

  private matchPossibleTokens(text: string, offset: LinearPosition, context: Context): MatchResult {
    const tokenDefinitions = tokens[context];
    let matchResult: MatchResult = { length: 0, context };
    for (const tokenDefinition of tokenDefinitions) {
      matchResult = this.matchToken(text, offset, context, tokenDefinition);
      if (matchResult.length > 0) {
        return matchResult;
      }
    }
    return matchResult;
  }

  private matchToken(text: string, offset: LinearPosition, context: Context, tokenDefinition: TokenDefinition): MatchResult {
    const match = text.match(tokenDefinition.pattern);
    return {
      length: match ? match[0].length : 0,
      token: (match && tokenDefinition.tokenType)
        ? {
          type: tokenDefinition.tokenType,
          start: offset,
          end: offset + match[0].length,
          text: match[0],
        }
        : undefined,
      context: match ? tokenDefinition.contextAfter : context,
    };
  }
}

export default class Parser {
  private tokenizer: Tokenizer;

  constructor() {
    this.tokenizer = new Tokenizer();
  }

  public parse(text: string): Tag[] {
    const tokens = this.tokenizer.tokenize(text);
    const tags = this.buildTags(text, tokens);
    return tags;
  }

  private buildTags(text: string, tokens: Token[]): Tag[] {
    const tags: Tag[] = [];
    let start = 0;
    let directives: Directive[] = [];
    for (const token of tokens) {
      switch (token.type) {
        case 'TAG_OPEN':
          start = token.start;
          directives = [];
          break;
        case 'TAG_CLOSE':
          tags.push({
            start: start,
            end: token.end,
            directives,
            contentText: this.getTagContentText(text, start, token.end),
            takesWholeLine: this.checkTagTakesWholeLine(text, start, token.end),
          });
          break;
        case 'NON_BLOCK_DIRECTIVE':
        case 'BLOCK_START_DIRECTIVE':
        case 'BLOCK_MIDDLE_DIRECTIVE':
        case 'BLOCK_END_DIRECTIVE':
          directives.push(token as Directive);
          break;
      }
    }
    return tags;
  }

  private getTagContentText(text: string, start: LinearPosition, end: LinearPosition): string {
    const raw = text.slice(start, end);
    return stripTag(raw);
  }

  private checkTagTakesWholeLine(text: string, start: LinearPosition, end: LinearPosition): boolean {
    const followsLineBreakAndIndent = start === 0 || /\n\s*$/.test(text.slice(0, start));
    const precedesLineBreak = text.length === end || text[end] === '\n';
    return followsLineBreakAndIndent && precedesLineBreak;
  }
}
