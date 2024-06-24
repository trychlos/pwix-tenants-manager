/*
 * pwix:tenants-manager/src/common/collections/tenants/collection.js
 */

import { Mongo } from 'meteor/mongo';

import '../../js/global.js';

export const Tenants = new Mongo.Collection( TenantsManager._conf.tenantsCollection );
