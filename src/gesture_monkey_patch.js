/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Overrides methods on Blockly.Gesture to integrate focus mangagement
 * with the gesture handling.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import * as Blockly from 'blockly/core';

const oldDoBlockClick = Blockly.Gesture.prototype.doBlockClick;

/**
 * Execute a block click. When in accessibility mode shift clicking will move
 * the cursor to the block.
 * @this {Blockly.Gesture}
 * @override
 */
Blockly.Gesture.prototype.doBlockClick = function (e) {
  this.creatorWorkspace?.getSvgGroup().focus();
  oldDoBlockClick.call(this, e);
};

const oldDispose = Blockly.Gesture.prototype.dispose;
Blockly.Gesture.prototype.dispose = function () {
  if (this.targetBlock && !this.targetBlock.disposed) {
    this.creatorWorkspace?.getSvgGroup().focus();
  }
  oldDispose.call(this);
};
