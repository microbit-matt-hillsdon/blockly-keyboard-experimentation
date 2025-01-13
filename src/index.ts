/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {NavigationController} from './navigation_controller';
import {installCursor} from './line_cursor';
import * as Constants from './constants';

export interface IExternalToolbox {
  focus(): void;
}

export interface IKeyboardNavigationOptions {
  externalToolbox?: IExternalToolbox;
}

/** Plugin for keyboard navigation. */
export class KeyboardNavigation {
  /** The workspace. */
  protected workspace: Blockly.WorkspaceSvg;
  private navigationController: NavigationController;
  private softWorkspaceFocus = false;

  /**
   * Constructs the keyboard navigation.
   *
   * @param workspace The workspace that the plugin will
   *     be added to.
   * @param options Options.
   */
  constructor(
    workspace: Blockly.WorkspaceSvg,
    options: IKeyboardNavigationOptions = {},
  ) {
    this.workspace = workspace;

    this.navigationController = new NavigationController(options);
    this.navigationController.init();
    this.navigationController.addWorkspace(workspace);
    this.navigationController.enable(workspace);
    this.navigationController.listShortcuts();

    this.setGlowTheme();
    installCursor(workspace.getMarkerManager());

    // Ensure that only the root SVG G (group) has a tab index.
    workspace.getInjectionDiv().removeAttribute('tabindex');
    workspace.getParentSvg().removeAttribute('tabindex');

    workspace.getSvgGroup().addEventListener('focus', () => {
      this.navigationController.setHasFocus(
        workspace,
        true,
        this.softWorkspaceFocus,
      );
    });
    workspace.getSvgGroup().addEventListener('blur', () => {
      this.navigationController.setHasFocus(workspace, false);
    });
  }

  /**
   * Focus the flyout if open.
   *
   * Generally not required if Blockly manages your toolbox.
   */
  focusFlyout(): void {
    this.navigationController.navigation.focusFlyout(this.workspace);
    // Focus the workspace after opening a flyout via an external toolbox.
    // The use of softWorkspaceFocus prevents workspace reset.
    this.softWorkspaceFocus = true;
    (this.workspace.getSvgGroup() as SVGElement).focus();
    this.softWorkspaceFocus = false;
  }

  /**
   * Called when an external toolbox takes the focus.
   */
  onExternalToolboxFocus(): void {
    this.workspace.keyboardAccessibilityMode = false;
    this.navigationController.navigation.setState(
      this.workspace,
      Constants.STATE.TOOLBOX,
    );
  }

  /**
   * Called when an external toolbox loses the focus.
   */
  onExternalToolboxBlur(): void {
    this.workspace.keyboardAccessibilityMode = true;
    // Don't fight with focusFlyout() -  we'll get that before the blur.
    if (
      this.navigationController.navigation.getState(this.workspace) ===
      Constants.STATE.TOOLBOX
    ) {
      this.navigationController.navigation.setState(
        this.workspace,
        Constants.STATE.WORKSPACE,
      );
    }
  }

  /**
   * Update the theme to match the selected glow colour to the cursor
   * colour.
   */
  setGlowTheme() {
    const newTheme = Blockly.Theme.defineTheme('zelosDerived', {
      name: 'zelosDerived',
      base: Blockly.Themes.Zelos,
      componentStyles: {
        selectedGlowColour: '#ffa200',
      },
    });
    this.workspace.setTheme(newTheme);
  }
}
