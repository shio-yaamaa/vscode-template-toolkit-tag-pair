import { WorkspaceConfiguration, workspace } from 'vscode';

class Config {
  private get root(): WorkspaceConfiguration {
    return workspace.getConfiguration('templateToolkitTagPair');
  }

  get general() {
    const sectionName = 'general';
    return {
      languages: this.root.get<string[]>(`${sectionName}.languages`),
    };
  }

  get highlight() {
    const sectionName = 'highlight';
    return {
      depthColors: this.root.get<string[]>(`${sectionName}.depthColors`),
    };
  }

  get correspondingDirective() {
    const sectionName = 'correspondingDirective';
    return {
      showOnHover: this.root.get<boolean>(`${sectionName}.showOnHover`),
      showNextToTag: this.root.get<'whenPossible' | 'whenDistant' | 'never'>(`${sectionName}.showNextToTag`),
    };
  }
};

export default new Config();
