/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

export const applyLineCursorPatch = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Blockly.LineCursor.prototype as any).getLastNode =
    function (): Blockly.ASTNode | null {
      const topBlocks = this.workspace.getTopBlocks(true);
      if (topBlocks.length === 0) {
        return null;
      }
      const lastTopBlockNode = Blockly.ASTNode.createTopNode(
        topBlocks[topBlocks.length - 1],
      );
      let prevNode = lastTopBlockNode;
      let nextNode: Blockly.ASTNode | null = lastTopBlockNode;
      while (nextNode) {
        prevNode = nextNode;
        nextNode = this.getNextNode(
          prevNode,
          this.validLineNode.bind(this),
          false,
        );
      }
      return prevNode;
    };

  Blockly.LineCursor.prototype.getPreviousNode = function (
    node: Blockly.ASTNode | null,
    isValid: (p1: Blockly.ASTNode | null) => boolean,
    loop = true,
  ): Blockly.ASTNode | null {
    if (!node) {
      return null;
    }
    let newNode: Blockly.ASTNode | null = node.prev();

    if (newNode) {
      // @ts-expect-error accessing private method
      newNode = this.getRightMostChild(newNode);
    } else {
      newNode = node.out();
    }
    if (newNode?.getType() !== Blockly.ASTNode.types.NEXT && isValid(newNode)) {
      return newNode;
    } else if (newNode) {
      // @ts-expect-error due to hacky patch
      return this.getPreviousNode(newNode, isValid, loop);
    }
    // Loop back to last block if it exists.
    if (loop) {
      // @ts-expect-error accessing method not defined in unpatched class
      return this.getLastNode();
    }
    return null;
  };

  Blockly.LineCursor.prototype.getNextNode = function (
    node: Blockly.ASTNode | null,
    isValid: (p1: Blockly.ASTNode | null) => boolean,
    loop = true,
  ): Blockly.ASTNode | null {
    if (!node) {
      return null;
    }
    const newNode = node.in() || node.next();
    if (isValid(newNode)) {
      return newNode;
    } else if (newNode) {
      // @ts-expect-error due to hacky patch
      return this.getNextNode(newNode, isValid, loop);
    }
    // @ts-expect-error accessing private method
    const siblingOrParentSibling = this.findSiblingOrParentSibling(node.out());
    if (siblingOrParentSibling) {
      // @ts-expect-error due to hacky patch
      return this.getNextNode(siblingOrParentSibling, isValid, loop);
    }
    if (loop) {
      // Loop back to first block if it exists.
      // @ts-expect-error accessing private method
      const topBlocks = this.workspace.getTopBlocks(true);
      return topBlocks.length > 0
        ? Blockly.ASTNode.createTopNode(topBlocks[0])
        : null;
    }
    return null;
  };

  // @ts-expect-error private
  Blockly.LineCursor.prototype.validLineNode = function (
    node: Blockly.ASTNode | null,
  ): boolean {
    if (!node) return false;
    const stackConnections = false;
    const location = node.getLocation();
    const type = node && node.getType();
    switch (type) {
      case Blockly.ASTNode.types.BLOCK:
        return !(location as Blockly.Block).outputConnection?.isConnected();
      case Blockly.ASTNode.types.INPUT: {
        const connection = location as Blockly.Connection;
        return (
          connection.type === Blockly.ConnectionType.NEXT_STATEMENT &&
          stackConnections
        );
      }
      case Blockly.ASTNode.types.NEXT:
        return (
          stackConnections || !(location as Blockly.Connection).isConnected()
        );
      case Blockly.ASTNode.types.PREVIOUS:
        return (
          stackConnections && !(location as Blockly.Connection).isConnected()
        );
      default:
        return false;
    }
  };

  // @ts-expect-error private
  Blockly.LineCursor.prototype.validInLineNode = function (
    node: Blockly.ASTNode | null,
  ): boolean {
    if (!node) return false;
    // @ts-expect-error private
    if (this.validLineNode(node)) return true;
    // const location = node.getLocation();
    const type = node && node.getType();
    switch (type) {
      case Blockly.ASTNode.types.BLOCK:
        return true;
      case Blockly.ASTNode.types.INPUT:
        return false;
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
