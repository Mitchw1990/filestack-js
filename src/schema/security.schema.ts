/*
 * Copyright (c) 2018 by Filestack.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export const SecuritySchema = {
  '$id': 'https://filestack.com/schemas/security.json',
  '$schema': 'http://json-schema.org/draft-07/schema#',
  title: 'Filestack Security Settings',
  description: 'Filestack security settings schema',
  type: 'object',
  additionalProperties: false,
  properties : {
    call: {
      '$ref': 'defs.json#/definitions/securityCallDef',
    },
    handle: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    maxSize: {
      type: 'integer',
    },
    minSize: {
      type: 'integer',
    },
    path: {
      type: 'string',
    },
    container: {
      type: 'string',
    },
  },
};
