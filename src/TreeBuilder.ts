import { Directive, Tag, TagIndex, Block } from './types';
import { createEmptyBlock } from './utility';

export default class TreeBuilder {
  public build(tags: Tag[]): Block {
    const stack = new Stack<Block>();
    const root = createEmptyBlock(-1);
    stack.push(root);

    for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {
      for (const directive of tags[tagIndex].directives) {
        switch (directive.type) {
          case 'BLOCK_START_DIRECTIVE':
            this.handleStartDirective(stack, directive, tagIndex);
            break;
          case 'BLOCK_MIDDLE_DIRECTIVE':
            this.handleMiddleDirective(stack, directive, tagIndex);
            break;
          case 'BLOCK_END_DIRECTIVE':
            this.handleEndDirective(stack, directive, tagIndex);
            break;
        }
      }
    }

    return root;
  }

  private handleStartDirective(stack: Stack<Block>, directive: Directive, tagIndex: TagIndex) {
    const stackTop = stack.top;
    if (!stackTop) return;
    const block = createEmptyBlock(stack.length - 1);
    block.startDirective = directive;
    block.startTagIndex = tagIndex;
    stackTop.children.push(block);
    stack.push(block);
  }

  private handleMiddleDirective(stack: Stack<Block>, directive: Directive, tagIndex: TagIndex) {
    const stackTop = stack.top;
    if (!stackTop) return;
    if (stackTop.depth === -1) {
      const block = createEmptyBlock(0);
      block.middleDirectives.push(directive);
      block.middleTagIndexes.push(tagIndex);
      stackTop.children.push(block);
      stack.push(block);
    } else {
      stackTop.middleDirectives.push(directive);
      stackTop.middleTagIndexes.push(tagIndex);
    }
  }

  private handleEndDirective(stack: Stack<Block>, directive: Directive, tagIndex: TagIndex) {
    const stackTop = stack.top;
    if (!stackTop) return;
    if (stackTop.depth === -1) {
      const block = createEmptyBlock(0);
      block.endDirective = directive;
      block.endTagIndex = tagIndex;
      stackTop.children.push(block);
      // Do not add to the stack because this block is already closed
    } else {
      const block = stack.pop()!;
      block.endDirective = directive;
      block.endTagIndex = tagIndex;
    }
  }
}

class Stack<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  push(item: T) {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  get top(): T | undefined {
    return this.items.length > 0
      ? this.items[this.items.length - 1]
      : undefined;
  }

  get length(): number {
    return this.items.length;
  }
}
