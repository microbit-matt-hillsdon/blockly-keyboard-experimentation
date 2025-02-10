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
  private softWorkspaceFocus = false;

  /** Event handler run when the workspace gains focus. */
  private focusListener: () => void;

  /** Event handler run when the workspace loses focus. */
  private blurListener: () => void;

  /** Keyboard navigation controller instance for the workspace. */
  private navigationController: NavigationController;

  /**
   * These fields are used to preserve the workspace's initial state to restore
   * it when/if keyboard navigation is disabled.
   */
  private injectionDivTabIndex: string | null;
  private workspaceParentTabIndex: string | null;
  private originalTheme: Blockly.Theme;
  private originalCursor: Blockly.Cursor | null;

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

    this.originalTheme = workspace.getTheme();
    this.setGlowTheme();
    this.originalCursor = workspace.getMarkerManager().getCursor();
    installCursor(workspace.getMarkerManager());

    // Ensure that only the root SVG G (group) has a tab index.
    this.injectionDivTabIndex = workspace
      .getInjectionDiv()
      .getAttribute('tabindex');
    workspace.getInjectionDiv().removeAttribute('tabindex');
    this.workspaceParentTabIndex = workspace
      .getParentSvg()
      .getAttribute('tabindex');
    workspace.getParentSvg().removeAttribute('tabindex');

    this.focusListener = () => {
      this.navigationController.setHasFocus(
        workspace,
        true,
        this.softWorkspaceFocus,
      );
    };
    this.blurListener = () => {
      this.navigationController.setHasFocus(workspace, false);
    };

    workspace.getSvgGroup().addEventListener('focus', this.focusListener);
    workspace.getSvgGroup().addEventListener('blur', this.blurListener);
    // Temporary workaround for #136.
    // TODO(#136): fix in core.
    workspace.getParentSvg().addEventListener('focus', this.focusListener);
    workspace.getParentSvg().addEventListener('blur', this.blurListener);
  }

  /**
   * Disables keyboard navigation for this navigator's workspace.
   */
  dispose() {
    // Temporary workaround for #136.
    // TODO(#136): fix in core.
    this.workspace
      .getParentSvg()
      .removeEventListener('blur', this.blurListener);
    this.workspace
      .getParentSvg()
      .removeEventListener('focus', this.focusListener);

    this.workspace.getSvgGroup().removeEventListener('blur', this.blurListener);
    this.workspace
      .getSvgGroup()
      .removeEventListener('focus', this.focusListener);

    if (this.workspaceParentTabIndex) {
      this.workspace
        .getParentSvg()
        .setAttribute('tabindex', this.workspaceParentTabIndex);
    }

    if (this.injectionDivTabIndex) {
      this.workspace
        .getInjectionDiv()
        .setAttribute('tabindex', this.injectionDivTabIndex);
    }

    if (this.originalCursor) {
      const markerManager = this.workspace.getMarkerManager();
      markerManager.setCursor(this.originalCursor);
    }

    this.workspace.setTheme(this.originalTheme);

    this.navigationController.dispose();
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
