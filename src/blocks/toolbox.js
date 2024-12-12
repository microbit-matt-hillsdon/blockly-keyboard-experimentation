/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  'kind': 'categoryToolbox',
  'contents': [
    {
      'kind': 'category',
      'name': 'Colours',
      'contents': [
        {
          kind: 'block',
          type: 'p5_background_color',
          inputs: {
            COLOR: {
              shadow: {
                type: 'colour_picker',
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'colour_random',
        },
      ],
    },
    {
      kind: 'category',
      name: 'Drawing',
      contents: [
        {
          kind: 'block',
          type: 'draw_emoji',
        },
        {
          kind: 'block',
          type: 'simple_circle',
          inputs: {
            COLOR: {
              shadow: {
                type: 'colour_picker',
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'write_text_with_shadow',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text_only',
              },
            },
          },
        },
        {
          kind: 'block',
          type: 'write_text_without_shadow',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'Misc',
      'contents': [
        {
          kind: 'label',
          text: 'This is a label',
        },
        {
          'kind': 'category',
          'name': 'A subcategory',
          'contents': [
            {
              kind: 'label',
              text: 'This is another label',
            },
            {
              kind: 'block',
              type: 'colour_random',
            },
          ],
        },
        {
          'kind': 'button',
          'text': 'This is a button',
          'callbackKey': 'unimplemented',
        },
        {
          kind: 'block',
          type: 'colour_random',
        },
      ],
    },
  ],
};
