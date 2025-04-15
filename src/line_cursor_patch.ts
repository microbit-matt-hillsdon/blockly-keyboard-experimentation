/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

export const applyLineCursorPatch = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Blockly.LineCursor.prototype as any).getLastNode = function (
    isValid: (p1: Blockly.ASTNode | null) => boolean,
  ): Blockly.ASTNode | null {
    // Loop back to last block if it exists.
    const topBlocks = this.workspace.getTopBlocks(true);
    if (!topBlocks.length) return null;

    // Find the last stack.
    const lastTopBlockNode = Blockly.ASTNode.createStackNode(
      topBlocks[topBlocks.length - 1],
    );
    let prevNode = lastTopBlockNode;
    let nextNode: Blockly.ASTNode | null = lastTopBlockNode;
    // Iterate until you fall off the end of the stack.
    while (nextNode) {
      prevNode = nextNode;
      nextNode = this.getNextNode(prevNode, isValid, false);
    }
    return prevNode;
  };

  Blockly.LineCursor.prototype.prev = function (): Blockly.ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode(
      curNode,
      // @ts-expect-error accessing private method
      this.validLineNode.bind(this),
      true,
    );
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  };

  Blockly.LineCursor.prototype.out = function (): Blockly.ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode(
      curNode,
      // @ts-expect-error accessing private method
      this.validInLineNode.bind(this),
      true,
    );

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  };

  Blockly.LineCursor.prototype.getPreviousNode = function (
    node: Blockly.ASTNode | null,
    isValid: (p1: Blockly.ASTNode | null) => boolean,
    loop: boolean,
  ): Blockly.ASTNode | null {
    if (!node) return null;
    // @ts-expect-error accessing private method
    const potential = this.getPreviousNodeImpl(node, isValid);
    if (potential || !loop) return potential;
    // Loop back.
    // @ts-expect-error passing unexpected arg
    const lastNode = this.getLastNode(isValid);
    if (isValid(lastNode)) return lastNode;
    // @ts-expect-error accessing private method
    return this.getPreviousNodeImpl(lastNode, isValid);
  };

  // @ts-expect-error accessing protected method
  Blockly.LineCursor.prototype.validLineNode = function (
    node: Blockly.ASTNode | null,
  ): boolean {
    if (!node) return false;
    const location = node.getLocation();
    const type = node && node.getType();
    switch (type) {
      case Blockly.ASTNode.types.BLOCK:
        return !(location as Blockly.Block).outputConnection?.isConnected();
      default:
        return false;
    }
  };

  // @ts-expect-error accessing protected method
  Blockly.LineCursor.prototype.validInLineNode = function (
    node: Blockly.ASTNode | null,
  ): boolean {
    if (!node) return false;
    // @ts-expect-error accessing private method
    if (this.validLineNode(node)) return true;
    const location = node.getLocation();
    const type = node && node.getType();
    switch (type) {
      case Blockly.ASTNode.types.BLOCK:
        return true;
      case Blockly.ASTNode.types.INPUT: {
        const connection = location as Blockly.Connection;
        return (
          connection.type !== Blockly.ConnectionType.NEXT_STATEMENT &&
          connection.type !== Blockly.ConnectionType.PREVIOUS_STATEMENT &&
          !connection.isConnected()
        );
      }
      case Blockly.ASTNode.types.FIELD: {
        const field = node.getLocation() as Blockly.Field;
        return !(
          field.getSourceBlock()?.isSimpleReporter() && field.isFullBlockField()
        );
      }
      default:
        return false;
    }
  };
};
