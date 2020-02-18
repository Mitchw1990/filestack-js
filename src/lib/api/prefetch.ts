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

import { ClientOptions, Session } from '../client';
import { PickerOptions } from './../picker';
import { requestWithSource } from '../api/request';
import { clone as lodashCloneDeep } from 'lodash.clonedeep';
import { merge as lodashMerge } from 'lodash.merge';

export type PrefetchOptionsSetting = {
  inapp_browser?: boolean;
  customsource?: boolean;
};

export type PrefetchOptionsPermissions = {
  intelligent_ingestion?: boolean;
  blocked?: boolean;
  blacklisted?: boolean;
  whitelabel?: boolean;
  transforms_ui?: boolean;
};

enum PrefetchOptionsEvents {
  PICKER = 'picker',
  TRANSFORM_UI = 'transform_ui',
}

type PrefetchOptions = {
  pickerOptions?: PickerOptions;
  settings?: PrefetchOptionsSetting;
  permissions?: PrefetchOptionsPermissions;
  events?: PrefetchOptionsEvents[];
};

interface PrefetchRequest {
  apikey: string;
  security?: {
    policy?: string;
    signature?: string;
  };
  permissions?: string[];
  settings?: string[];
  events?: PrefetchOptionsEvents[];
  pickerOptions?: PickerOptions;
}

type PrefetchResponse = {
  blocked?: boolean;
  settings?: PrefetchOptionsSetting;
  permissions?: PrefetchOptionsPermissions;
  updated_config?: {
    fromSources?: string[];
  };
};

// ==>
// {
//   "apikey": "AHvhedybhQMqZOqRvZquez",
//   security: {
//     policy: "",
//     signature: ""
//   },
// 	"permissions": ["transforms_ui", "gmail"], -- events
// 	"settings": ["inapp_browser", "customsource"],
// 	"events": ["picker"], -- events
// 	"picker_config": {
// 		"fromSources": ["googledrive", "dropbox"]
// 	}
// }

// <==
// {
//   "blocked": false,
//   "settings": {
//     "customsource": false,
//     "inapp_browser": true
//   },
//   "permissions": {
//     "transforms_ui": false
//   },
//   "updated_config": {
//     "fromSources": [
//       "googledrive"
//     ]
//   }
// }

/**
 * @private
 */
export class Prefetch {
  private session: Session;

  private prefetchUrl: string;

  private configToCheck: PickerOptions;

  constructor(session: Session) {
    this.session = session;
    this.prefetchUrl = session.urls.cloudApiUrl;
  }

  async getConfig({ pickerOptions, settings, permissions, events }: PrefetchOptions) {
    if (this.session.prefetch) {
      await requestWithSource().post(`${this.prefetchUrl}/prefetch`, {
        events,
      });

      return Promise.resolve(this.session.prefetch);
    }

    const configToSend = this.cleanUpCallback(pickerOptions);

    let paramsToSend: PrefetchRequest = {
      apikey: this.session.apikey,
      permissions: Object.keys(permissions),
      settings: Object.keys(settings),
      pickerOptions: configToSend,
      events,
    };

    if (this.session.policy && this.session.signature) {
      paramsToSend.security = { signature: this.session.signature, policy: this.session.signature };
    }

    const response = await requestWithSource()
      .post(`${this.prefetchUrl}/prefetch`, paramsToSend)
      .then(res => res.data);

    return this.reassignCallbacks(response);
  }

  private cleanUpCallback(pickerOptions: PickerOptions) {
    this.configToCheck = lodashCloneDeep(pickerOptions);

    Object.keys(this.configToCheck).map(key => {
      if (key.indexOf('on') === 0) {
        this.configToCheck[key] = undefined;
      }
    });

    return this.configToCheck;
  }

  private reassignCallbacks(response: PrefetchResponse) {
    return lodashMerge({}, response);
  }
}
