/*
 * pwix:tenants-manager/src/common/collections/entities/server/index.js
 */

import { Tracker } from 'meteor/tracker';

import './deny.js';
import './functions.js';
import './methods.js';
import './publish.js';

Tracker.autorun(( comp ) => {
    TenantsManager.Entities.ready( true );
    comp.stop();
});
