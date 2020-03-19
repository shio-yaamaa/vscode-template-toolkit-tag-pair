import * as legacyAssert from 'assert';

import { Tag } from '../../types';
import Parser from '../../Parser';

const assert = legacyAssert.strict;

interface TestCase {
  text: string;
  expectedTags: Tag[];
}

const testParser = (testCases: TestCase[]) => {
  const parser = new Parser();
  for (const { text, expectedTags } of testCases) {
    assert.deepEqual(parser.parse(text), expectedTags);
  }
};

suite('Parser Test Suite', () => {
	test('Root elements', () => {
    const testCases: TestCase[] = [
      // Plain text + comment tag
      {
        text: "SET[%# %]",
        expectedTags: [],
      },
      // Comment tag + plain text
      {
        text: "[%# %]SET",
        expectedTags: [],
      },
      // Plain text + tag
      {
        text: "SET[% %]",
        expectedTags: [
          { start: 3, end: 8, directives: [], contentText: '' },
        ],
      },
      // Tag + plain text
      {
        text: "[% %]SET",
        expectedTags: [
          { start: 0, end: 5, directives: [], contentText: '' },
        ],
      },
      // Comment tag + tag
      {
        text: "[%# %][% %]",
        expectedTags: [
          { start: 6, end: 11, directives: [], contentText: '' },
        ],
      },
      // Tag + comment tag
      {
        text: "[% %][%# %]",
        expectedTags: [
          { start: 0, end: 5, directives: [], contentText: '' },
        ],
      },
    ];

    testParser(testCases);
  });

  test('Plain text', () => {
    const testCases: TestCase[] = [
      // With line break
      {
        text: 'SET\nSET',
        expectedTags: [],
      },
      // Non-ASCII characters
      {
        text: 'あいうえお',
        expectedTags: [],
      },
      // Special characters
      {
        text: `"" '' # %]`,
        expectedTags: [],
      },
    ];

    testParser(testCases);
  });

  test('Comment tags and tags', () => {
    const testCases: TestCase[] = [
      // Comment tag
      {
        text: '[%# SET %]',
        expectedTags: [],
      },
      // Comment tag + whitespace chomping option
      {
        text: '[%-# SET -%]',
        expectedTags: [],
      },
      {
        text: '[%+# SET +%]',
        expectedTags: [],
      },
      // Comment tag + line break
      {
        text: '[%# SET \n SET %]',
        expectedTags: [],
      },
      // Tag
      {
        text: '[% %]',
        expectedTags: [
          { start: 0, end: 5, directives: [], contentText: '' },
        ],
      },
      // Tag + whitespace chomping option
      {
        text: '[%- -%]',
        expectedTags: [
          { start: 0, end: 7, directives: [], contentText: '' },
        ],
      },
      {
        text: '[%+ +%]',
        expectedTags: [
          { start: 0, end: 7, directives: [], contentText: '' },
        ],
      },
      // Tag + line break
      {
        text: '[% aaa \n aaa %]',
        expectedTags: [
          { start: 0, end: 15, directives: [], contentText: 'aaa \n aaa' },
        ],
      },
    ];

    testParser(testCases);
  });

  test('Comments', () => {
    const testCases: TestCase[] = [
      // Comment ending before a tag close
      {
        text: '[% # SET %]',
        expectedTags: [
          { start: 0, end: 11, directives: [], contentText: '# SET' },
        ],
      },
      // Comment ending in a line break
      {
        text: '[% # SET \n SET %]',
        expectedTags: [
          {
            start: 0,
            end: 17,
            directives: [
              {
                type: 'NON_BLOCK_DIRECTIVE',
                start: 11,
                end: 14,
                text: 'SET',
              },
            ],
            contentText: '# SET \n SET',
          },
        ],
      },
    ];

    testParser(testCases);
  });

  test('Tag contents', () => {
    const testCases: TestCase[] = [
      // String literal
      {
        text: `[% '' "" 'SET' "SET" %]`,
        expectedTags: [
          { start: 0, end: 23, directives: [], contentText: `'' "" 'SET' "SET"` },
        ],
      },
      // Directives
      {
        text: '[% SET IF\nELSE;END %]',
        expectedTags: [
          {
            start: 0,
            end: 21,
            directives: [
              {
                type: 'NON_BLOCK_DIRECTIVE',
                start: 3,
                end: 6,
                text: 'SET',
              },
              {
                type: 'BLOCK_START_DIRECTIVE',
                start: 7,
                end: 9,
                text: 'IF',
              },
              {
                type: 'BLOCK_MIDDLE_DIRECTIVE',
                start: 10,
                end: 14,
                text: 'ELSE',
              },
              {
                type: 'BLOCK_END_DIRECTIVE',
                start: 15,
                end: 18,
                text: 'END',
              },
            ],
            contentText: 'SET IF\nELSE;END',
          },
        ],
      },
      // Invalid directives
      {
        text: '[% IFEND %]',
        expectedTags: [
          { start: 0, end: 11, directives: [], contentText: 'IFEND' },
        ],
      },
      {
        text: '[% set %]',
        expectedTags: [
          { start: 0, end: 9, directives: [], contentText: 'set' },
        ],
      },
    ];
  });
});
