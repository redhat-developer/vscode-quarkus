import { MultiStepInput } from './multiStepUtils';
import { QExtension } from './interface/QExtension';
import { State } from './class/State';

enum Type {
  Extension,
  Stop,
  LastUsed
}

interface QuickPickItem {
  type: Type; // stop, last used, extension
  label: string;
  description: string;
  detail?: string;
  artifactId?:string; // only for extensions
}


export async function pickExtensions(input: MultiStepInput, state: Partial<State>, allExtensions: QExtension[]) {

  const defaultExtensions: QExtension[] = [];
  let selectedExtensions: QExtension[] = [];
  let unselectedExtensions: QExtension[] = allExtensions;
  let pick: QuickPickItem;

  do {

    const quickPickItems: QuickPickItem[] = getItems(selectedExtensions, unselectedExtensions);

    pick = await input.showQuickPick({
      title: 'Inside of multiQuickPick.ts',
      step: 4,
      totalSteps: 100,
      value: 'Default resource name',
      placeholder: 'Pick extensions (placeholder)',
      items: quickPickItems,
      shouldResume: shouldResume
    });

    switch (pick.type) {
      case Type.Extension: {

        // unselect
        if (selectedExtensions.some((it) => { return it.artifactId === pick.artifactId; })) {
          const dependency = selectedExtensions.find((it) => it.artifactId === pick.artifactId);
          if (dependency) {
            selectedExtensions = selectedExtensions.filter((it) => it.artifactId !== pick.artifactId);
            unselectedExtensions.push(dependency);
            unselectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
          }
        } else {
          //select
          const dependency = unselectedExtensions.find(((it) => { return it.artifactId === pick.artifactId; }));
          if (dependency) {
            unselectedExtensions = unselectedExtensions.filter((it) => it.artifactId !== pick.artifactId);
            selectedExtensions.push(dependency);
            selectedExtensions.sort((a, b) => a.name.localeCompare(b.name));
          }
        }

        break;
      }
      case Type.LastUsed: {
        state.extensions = defaultExtensions;
      }
      case Type.Stop: {
        state.extensions = selectedExtensions;
      }
    }

  } while (pick.type === Type.Extension);
}


function getItems(selected: QExtension[], unselected: QExtension[]): QuickPickItem[] {
  const items: QuickPickItem[] = selected.concat(unselected).map((it) => {
    return {
      type: Type.Extension,
      label: `${selected.some((other) => it.artifactId === other.artifactId) ? '$(check) ' : ''}${it.name}`,
      description: `(${it.artifactId})`,
      artifactId: it.artifactId
    };
  });

  //Push the dependencies selection stopper on top of the dependencies list
  items.unshift({
    type: Type.Stop,
    label: `$(tasklist) ${selected.length} extensions selected`,
    description: '',
    detail: 'Press <Enter>  to continue'
  });

  if (selected.length === 0) { // TODO pass default extensions to this function. if exists, run addLastUsedOption
    addLastUsedOption(items, []);
  }

  return items;
}

function addLastUsedOption(items: QuickPickItem[], prevExtensions: QExtension[]) {

  const extensionNames = prevExtensions.map((it) => it.name).join(', ');

  items.unshift({
    type: Type.LastUsed,
    label: `$(clock) Last used`,
    description: '',
    detail: extensionNames
  });
}

function shouldResume() {
  // Could show a notification with the option to resume.
  return new Promise<boolean>((resolve, reject) => {
  });
}

async function validateNameIsUnique(name: string) {
  // ...validate...
  // await new Promise(resolve => setTimeout(resolve, 1000));
  return name === 'vscode' ? 'Name not unique' : undefined;
}