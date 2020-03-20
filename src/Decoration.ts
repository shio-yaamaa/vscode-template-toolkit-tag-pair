import {
  TextEditor,
  TextEditorDecorationType,
  DecorationOptions,
  ThemableDecorationAttachmentRenderOptions,
  DecorationRangeBehavior,
  Range,
  MarkdownString,
  window,
} from 'vscode';

// A group whose members share the same decoration type (same background color)
// For example, when there are 5 colors,
// blocks in the depth 0 and 5 have the same decoration type.
interface DecorationGroup {
  type: TextEditorDecorationType;
  optionsList: DecorationOptions[]; // One DecorationOptions corresponds to an instance of decoration
}

interface AttachedText {
  hover?: string;
  after?: string;
}

export default class Decoration {
  private editor: TextEditor;
  private decorationGroups: DecorationGroup[];
  private afterTextStyle: ThemableDecorationAttachmentRenderOptions;

  constructor(editor: TextEditor, colors: string[], afterTextStyle: ThemableDecorationAttachmentRenderOptions) {
    this.editor = editor;
    this.decorationGroups = colors.map(color => {
      return {
        type: window.createTextEditorDecorationType({
          backgroundColor: color,
          rangeBehavior: DecorationRangeBehavior.ClosedClosed,
        }),
        optionsList: [],
      };
    });
    this.afterTextStyle = afterTextStyle;
  }

  public addDecoration(colorIndex: number, range: Range, attachedText: AttachedText) {
    const hoverMessage = attachedText.hover
      ? new MarkdownString(attachedText.hover)
      : undefined;
    const renderOptions = attachedText.after
      ? {
        after: {
          ...this.afterTextStyle,
          contentText: attachedText.after,
        },
      }
      : undefined;
    this.decorationGroups[colorIndex].optionsList.push({
      hoverMessage,
      range,
      renderOptions,
    });
  }

  public apply() {
    // To clear the previously rendered decorations,
    // setDecorations() must be called even if the decoration group has no ranges
    for (const group of this.decorationGroups) {
      this.editor.setDecorations(group.type, group.optionsList);
    }
  }
}
