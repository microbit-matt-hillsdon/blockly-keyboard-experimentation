/**
 * Centralises hints that we show.
 *
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {WorkspaceSvg} from 'blockly';
import {SHORTCUT_NAMES} from './constants';
import {getShortActionShortcut} from './shortcut_formatting';
import {clearToast, toast} from './toast';

const unconstrainedMoveHintId = 'unconstrainedMoveHint';
const constrainedMoveHintId = 'constrainedMoveHint';
const copiedHintId = 'copiedHint';
const helpHintId = 'helpHint';

/**
 * Nudge the user to use unconstrained movement.
 *
 * @param workspace Workspace.
 * @param force Set to show it even if previously shown.
 */
export function showUnconstrainedMoveHint(
  workspace: WorkspaceSvg,
  force = false,
) {
  const enter = getShortActionShortcut(SHORTCUT_NAMES.EDIT_OR_CONFIRM);
  const modifier = navigator.platform.startsWith('Mac') ? '⌥' : 'Ctrl';
  const message = `Hold ${modifier} and use arrow keys to move freely, then ${enter} to accept the position`;
  toast(workspace, {
    message,
    id: unconstrainedMoveHintId,
    oncePerSession: !force,
  });
}

/**
 * Nudge the user to move a block that's in move mode.
 *
 * @param workspace Workspace.
 */
export function showConstrainedMovementHint(workspace: WorkspaceSvg) {
  const enter = getShortActionShortcut(SHORTCUT_NAMES.EDIT_OR_CONFIRM);
  const message = `Use the arrow keys to move, then ${enter} to accept the position`;
  toast(workspace, {message, id: constrainedMoveHintId, oncePerSession: true});
}

/**
 * Clear active move-related hints, if any.
 *
 * @param workspace The workspace.
 */
export function clearMoveHints(workspace: WorkspaceSvg) {
  clearToast(workspace, constrainedMoveHintId);
  clearToast(workspace, unconstrainedMoveHintId);
}

/**
 * Nudge the user to paste after a copy.
 *
 * @param workspace Workspace.
 */
export function showCopiedHint(workspace: WorkspaceSvg) {
  toast(workspace, {
    message: `Copied. Press ${getShortActionShortcut('paste')} to paste.`,
    duration: 7000,
    id: copiedHintId,
  });
}

/**
 * Clear active paste-related hints, if any.
 *
 * @param workspace The workspace.
 */
export function clearPasteHints(workspace: WorkspaceSvg) {
  // TODO: cut?
  clearToast(workspace, copiedHintId);
}

/**
 * Nudge the user to open the help.
 *
 * @param workspace The workspace.
 */
export function showHelpHint(workspace: WorkspaceSvg) {
  const shortcut = getShortActionShortcut('list_shortcuts');
  const message = `Press ${shortcut} for help on keyboard controls`;
  const id = helpHintId;
  toast(workspace, {message, id});
}

/**
 * Clear the help hint.
 *
 * @param workspace The workspace.
 */
export function clearHelpHint(workspace: WorkspaceSvg) {
  // TODO: We'd like to do this in MakeCode too as we override.
  // Could have an option for showing help in the plugin?
  clearToast(workspace, helpHintId);
}
