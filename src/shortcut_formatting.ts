/**
 * Check the platform and return a prefix for the keyboard shortcut.
 * TODO: https://github.com/google/blockly-keyboard-experimentation/issues/155
 * This will eventually be the responsibility of the action code ib
 * Blockly core.
 *
 * @param key The key to press in combination with Ctrl of Command.
 * @returns A platform-appropriate string for the meta key.
 */
export function formatMetaShortcut(key: string) {
  return `${navigator.platform.startsWith('Mac') ? '⌘' : 'Ctrl + '}${key}`;
}
