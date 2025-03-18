/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {NavigationController} from './navigation_controller';
import {CursorOptions, LineCursor} from './line_cursor';
import {
  classifyBlurRelatedTarget,
  getFlyoutElement,
  getToolboxElement,
} from './workspace_utilities';
import {BlurRelatedTarget} from './navigation';

/** Options object for KeyboardNavigation instances. */
export type NavigationOptions = {
  cursor: Partial<CursorOptions>;
};

/** Default options for LineCursor instances. */
const defaultOptions: NavigationOptions = {
  cursor: {},
};

/** Plugin for keyboard navigation. */
export class KeyboardNavigation {
  /** The workspace. */
  protected workspace: Blockly.WorkspaceSvg;

  /** Event handler run when the workspace gains focus. */
  private focusListener: (e: Event) => void;

  /** Event handler run when the workspace loses focus. */
  private blurListener: () => void;

  /** Event handler run when the toolbox gains focus. */
  private toolboxFocusListener: () => void;

  /** Event handler run when the toolbox loses focus. */
  private toolboxBlurListener: (e: Event) => void;

  /** Event handler run when the flyout gains focus. */
  private flyoutFocusListener: () => void;

  /** Event handler run when the flyout loses focus. */
  private flyoutBlurListener: (e: Event) => void;

  /** Keyboard navigation controller instance for the workspace. */
  private navigationController: NavigationController;

  /** Cursor for the main workspace. */
  private cursor: LineCursor;

  /**
   * These fields are used to preserve the workspace's initial state to restore
   * it when/if keyboard navigation is disabled.
   */
  private injectionDivTabIndex: string | null;
  private workspaceParentTabIndex: string | null;
  private originalTheme: Blockly.Theme;

  /**
   * Constructs the keyboard navigation.
   *
   * @param workspace The workspace that the plugin will
   *     be added to.
   */
  constructor(
    workspace: Blockly.WorkspaceSvg,
    options: Partial<NavigationOptions>,
  ) {
    this.workspace = workspace;

    // Regularise options and apply defaults.
    options = {...defaultOptions, ...options};

    this.navigationController = new NavigationController();
    this.navigationController.init();
    this.navigationController.addWorkspace(workspace);
    this.navigationController.enable(workspace);

    this.originalTheme = workspace.getTheme();
    this.setGlowTheme();

    this.cursor = new LineCursor(workspace, options.cursor);
    this.cursor.install();

    // Ensure that only the root SVG G (group) has a tab index.
    this.injectionDivTabIndex = workspace
      .getInjectionDiv()
      .getAttribute('tabindex');
    workspace.getInjectionDiv().removeAttribute('tabindex');
    this.workspaceParentTabIndex = workspace
      .getParentSvg()
      .getAttribute('tabindex');
    // We add a focus listener below so use -1 so it doesn't become focusable.
    workspace.getParentSvg().setAttribute('tabindex', '-1');

    // Move the flyout for logical tab order.
    const flyoutElement = getFlyoutElement(workspace);
    flyoutElement?.parentElement?.insertBefore(
      flyoutElement,
      workspace.getParentSvg(),
    );
    // Allow tab to the flyout only when there's no toolbox.
    if (workspace.getToolbox() && flyoutElement) {
      flyoutElement.tabIndex = -1;
    }

    this.focusListener = (e: Event) => {
      if (e.currentTarget === this.workspace.getParentSvg()) {
        // Starting a gesture unconditionally calls markFocus on the parent SVG
        // but we really don't want to move to the workspace (and close the
        // flyout) if all you did was click in a flyout, potentially on a
        // button.
        const isCurrentGestureInFlyout =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          !!(this.workspace.currentGesture_ as any)?.flyout;
        if (isCurrentGestureInFlyout) {
          this.navigationController.focusFlyout(workspace);
        } else {
          this.navigationController.focusWorkspace(workspace);
        }
      } else {
        this.navigationController.handleFocusWorkspace(workspace);
      }
    };
    this.blurListener = () => {
      this.navigationController.handleBlurWorkspace(workspace);
    };

    workspace.getSvgGroup().addEventListener('focus', this.focusListener);
    workspace.getSvgGroup().addEventListener('blur', this.blurListener);

    const toolboxElement = getToolboxElement(workspace);
    this.toolboxFocusListener = () => {
      this.navigationController.handleFocusToolbox(workspace);
    };
    this.toolboxBlurListener = (e: Event) => {
      this.navigationController.handleBlurToolbox(
        workspace,
        classifyBlurRelatedTarget(e, flyoutElement, BlurRelatedTarget.FLYOUT),
      );
    };
    toolboxElement?.addEventListener('focus', this.toolboxFocusListener);
    toolboxElement?.addEventListener('blur', this.toolboxBlurListener);

    this.flyoutFocusListener = () => {
      this.navigationController.handleFocusFlyout(workspace);
    };
    this.flyoutBlurListener = (e: Event) => {
      this.navigationController.handleBlurFlyout(
        workspace,
        classifyBlurRelatedTarget(e, flyoutElement, BlurRelatedTarget.TOOLBOX),
      );
    };
    flyoutElement?.addEventListener('focus', this.flyoutFocusListener);
    flyoutElement?.addEventListener('blur', this.flyoutBlurListener);

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

    const toolboxElement = getToolboxElement(this.workspace);
    toolboxElement?.removeEventListener('focus', this.toolboxFocusListener);
    toolboxElement?.removeEventListener('blur', this.toolboxBlurListener);

    const flyoutElement = getFlyoutElement(this.workspace);
    flyoutElement?.removeEventListener('focus', this.flyoutFocusListener);
    flyoutElement?.removeEventListener('blur', this.flyoutBlurListener);

    if (this.workspaceParentTabIndex) {
      this.workspace
        .getParentSvg()
        .setAttribute('tabindex', this.workspaceParentTabIndex);
    } else {
      this.workspace.getParentSvg().removeAttribute('tabindex');
    }

    if (this.injectionDivTabIndex) {
      this.workspace
        .getInjectionDiv()
        .setAttribute('tabindex', this.injectionDivTabIndex);
    } else {
      this.workspace.getInjectionDiv().removeAttribute('tabindex');
    }

    this.cursor.uninstall();

    this.workspace.setTheme(this.originalTheme);

    this.navigationController.dispose();
  }

  /**
   * Toggle visibility of a help dialog for the keyboard shortcuts.
   */
  toggleShortcutDialog(): void {
    this.navigationController.shortcutDialog.toggle();
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
