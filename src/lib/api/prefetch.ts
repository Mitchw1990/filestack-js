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

import { Session } from '../client';
import { PickerOptions } from './../picker';
import { FsRequest } from '../request';
import { cleanUpCallback, reassignCallbacks } from '../utils';

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

export enum PrefetchOptionsEvents {
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
  picker_config?: PickerOptions;
}

export type PrefetchResponse = {
  blocked?: boolean;
  settings?: PrefetchOptionsSetting;
  permissions?: PrefetchOptionsPermissions;
  updated_config?: {
    fromSources?: string[];
  };
};

/**
 * @private
 */
export class Prefetch {
  private session: Session;
  private prefetchUrl: string;
  private configToCheck: PickerOptions;

  constructor(session: Session) {
    this.session = session;
    this.prefetchUrl = session.urls.uploadApiUrl;
  }

  async getConfig({ pickerOptions, settings, permissions, events }: PrefetchOptions) {
    if (this.session.prefetch) {
      FsRequest.post(`${this.prefetchUrl}/prefetch`, { events });
      return Promise.resolve(this.session.prefetch);
    }

    const configToSend = cleanUpCallback(this.configToCheck, pickerOptions);
    const permissionsKeys = [...Object.keys(permissions)];

    let paramsToSend: PrefetchRequest = {
      apikey: this.session.apikey,
      permissions: permissionsKeys,
      settings: Object.keys(settings),
      picker_config: configToSend,
      events,
    };

    if (this.session.policy && this.session.signature) {
      paramsToSend.security = { policy: this.session.policy, signature: this.session.signature };
    }

    const { data } = await FsRequest.post(`${this.prefetchUrl}/prefetch`, paramsToSend).then(res => res.data);

    // const response = await requestWithSource()
    //   .post(`${this.prefetchUrl}/prefetch`, paramsToSend)
    //   .then(res => res.data);

    return reassignCallbacks(this.configToCheck, data);
  }
}
