import {
  TextEditor,
  TextEditorDecorationType,
  DecorationOptions,
} from 'vscode';

export type DecorationGroupId = number | string;

// A group whose members share the same DecorationType
interface DecorationGroup {
  type: TextEditorDecorationType;
  optionsList: DecorationOptions[]; // One DecorationOptions corresponds to an instance of decoration
}

// Aggregates all the options for decoration instances with the same DecorationType.
// This aggregator is needed because TextEditor.setDecorations() overwrites
// the previously rendered decorations with the same DecorationType.
export default class DecorationAggregator {
  private decorationGroups: Map<DecorationGroupId, DecorationGroup>;

  // Register all the necessary DecorationTypes and associated keys
  constructor(types: Map<DecorationGroupId, TextEditorDecorationType>) {
    this.decorationGroups = new Map<DecorationGroupId, DecorationGroup>(
      Array.from(types.entries()).map(([key, value]) => {
        return [
          key,
          {
            type: value,
            optionsList: [],
          },
        ];
      })
    );
  }

  public addDecoration(groupId: DecorationGroupId, options: DecorationOptions) {
    const group = this.decorationGroups.get(groupId);
    if (!group) return;
    group.optionsList.push(options);
  }

  public apply(editor: TextEditor) {
    // To clear the previously rendered decorations,
    // setDecorations() must be called even if the decoration group has no associated options
    for (const group of this.decorationGroups.values()) {
      editor.setDecorations(group.type, group.optionsList);
    }
    this.clear();
  }

  private clear() {
    for (const group of this.decorationGroups.values()) {
      group.optionsList = [];
    }
  }
}
