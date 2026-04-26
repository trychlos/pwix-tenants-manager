/*
 * pwix:tenants-manager/src/common/collections/tenants/collection.js
 */

import { Logger } from 'meteor/pwix:logger';
import { ReactiveVar } from 'meteor/reactive-var';

import '../../js/index.js';

const logger = Logger.get();

export const Tenants = {
    fieldSet: new ReactiveVar( null )
};

TenantsManager.Tenants = Tenants;
