/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ShortcutRegistry,
  WorkspaceSvg,
  getFocusManager,
  utils,
} from 'blockly/core';
import { KeyboardShortcut } from 'node_modules/blockly/core/shortcut_registry';

const SHORTCUT_PREV_STACK = utils.KeyCodes.P;
const SHORTCUT_NEXT_STACK = utils.KeyCodes.N;

/**
 * Class for registering a shortcut for quick movement between root blocks.
 */
export class StackNavigationAction {
  stackShortcuts: KeyboardShortcut[] = [];
  install() {
    const preconditionFn = (workspace: WorkspaceSvg) => {
      const currentRoot = workspace?.getCursor()?.getSourceBlock()?.getRootBlock();
      return !!currentRoot;
    }
    
    const previousStackShortcut: KeyboardShortcut = {
      name: 'go_to_previous_stack',
      preconditionFn,
      callback: (workspace) => {
        const currentRoot = workspace?.getCursor()?.getSourceBlock()?.getRootBlock();
        if (!currentRoot) return false;
        const prevRoot = workspace.getNavigator().getPreviousSibling(currentRoot);
        if (!prevRoot) return false;
        getFocusManager().focusNode(prevRoot);
        return true;
      },
      keyCodes: [SHORTCUT_PREV_STACK],
    };

    const nextStackShortcut: KeyboardShortcut = {
      name: 'go_to_next_stack',
      preconditionFn,
      callback: (workspace) => {
        const currentRoot = workspace?.getCursor()?.getSourceBlock()?.getRootBlock();
        if (!currentRoot) return false;
        const nextRoot = workspace.getNavigator().getNextSibling(currentRoot);
        if (!nextRoot) return false;
        getFocusManager().focusNode(nextRoot);
        return true;
      },
      keyCodes: [SHORTCUT_NEXT_STACK],
    };

    ShortcutRegistry.registry.register(previousStackShortcut);
    this.stackShortcuts.push(previousStackShortcut);
    ShortcutRegistry.registry.register(nextStackShortcut);
    this.stackShortcuts.push(nextStackShortcut);
  }

  /**
   * Reverts the patched undo/redo shortcuts in the registry.
   */
  uninstall() {
    this.stackShortcuts.forEach(ss => ShortcutRegistry.registry.unregister(ss.name));
    this.stackShortcuts = [];
  }
}
