/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as chai from 'chai';
import {Key} from 'webdriverio';
import {
  getFocusedBlockType,
  moveToToolboxCategory,
  PAUSE_TIME,
  focusOnBlock,
  tabNavigateToWorkspace,
  testFileLocations,
  testSetup,
  keyRight,
  keyUp,
  tabNavigateToToolbox,
} from './test_setup.js';

suite('Insert test', function () {
  // Setting timeout to unlimited as these tests take longer time to run
  this.timeout(0);

  // Clear the workspace and load start blocks
  setup(async function () {
    this.browser = await testSetup(testFileLocations.BASE);
    await this.browser.pause(PAUSE_TIME);
  });

  test('Insert C-shaped block with statement block selected', async function () {
    // Navigate to draw_circle_1.
    await tabNavigateToWorkspace(this.browser);
    await focusOnBlock(this.browser, 'draw_circle_1');

    await moveToToolboxCategory(this.browser, 'Functions');
    // Move to flyout.
    await keyRight(this.browser);
    // Select Function block.
    await this.browser.keys(Key.Enter);
    // Confirm move.
    await this.browser.keys(Key.Enter);

    chai.assert.equal(
      'procedures_defnoreturn',
      await getFocusedBlockType(this.browser),
    );
  });

  test('Insert without having focused the workspace', async function () {
    await tabNavigateToToolbox(this.browser);

    // Insert 'if' block
    await keyRight(this.browser);
    // Choose.
    await this.browser.keys(Key.Enter);
    // Confirm position.
    await this.browser.keys(Key.Enter);

    // Assert inserted inside first block p5_setup not at top-level.
    chai.assert.equal('controls_if', await getFocusedBlockType(this.browser));
    await keyUp(this.browser);
    chai.assert.equal(
      'p5_background_color',
      await getFocusedBlockType(this.browser),
    );
  });
});
