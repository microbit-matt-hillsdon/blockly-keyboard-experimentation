/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/**
 * Scrolls the provided bounds into view.
 *
 * In the case of small workspaces/large bounds, this function prioritizes
 * getting the top left corner of the bounds into view. It also adds some
 * padding when scrolling to allow the element to be comfortably in view.
 *
 * @param bounds A rectangle to scroll into view, as best as possible.
 * @param workspace The workspace to scroll the given bounds into view in.
 */
export function scrollBoundsIntoView(
  bounds: Blockly.utils.Rect,
  workspace: Blockly.WorkspaceSvg,
) {
  const scale = workspace.getScale();

  const rawViewport = workspace.getMetricsManager().getViewMetrics(true);
  const viewport = new Blockly.utils.Rect(
    rawViewport.top,
    rawViewport.top + rawViewport.height,
    rawViewport.left,
    rawViewport.left + rawViewport.width,
  );

  if (
    bounds.left >= viewport.left &&
    bounds.top >= viewport.top &&
    bounds.right <= viewport.right &&
    bounds.bottom <= viewport.bottom
  ) {
    // Do nothing if the block is fully inside the viewport.
    return;
  }

  const paddedBounds = bounds.clone();

  // Add some padding to the bounds so the element is scrolled comfortably
  // into view.
  paddedBounds.top -= 10;
  paddedBounds.bottom += 10;
  paddedBounds.left -= 10;
  paddedBounds.right += 10;

  let deltaX = 0;
  let deltaY = 0;

  if (paddedBounds.left < viewport.left) {
    deltaX = viewport.left - paddedBounds.left;
  } else if (paddedBounds.right > viewport.right) {
    deltaX = viewport.right - paddedBounds.right;
  }

  if (paddedBounds.top < viewport.top) {
    deltaY = viewport.top - paddedBounds.top;
  } else if (paddedBounds.bottom > viewport.bottom) {
    deltaY = viewport.bottom - paddedBounds.bottom;
  }

  deltaX *= scale;
  deltaY *= scale;
  workspace.scroll(workspace.scrollX + deltaX, workspace.scrollY + deltaY);
}
