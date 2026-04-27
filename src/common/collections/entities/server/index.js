/*
 * pwix:tenants-manager/src/common/collections/entities/server/index.js
 */

import { Tracker } from 'meteor/tracker';

import './deny.js';
import './functions.js';
import './methods.js';
import './publish.js';

Tracker.autorun(() => {
    const haveCollection = TenantsManager.Entities.status.get( 'haveCollection' );
    const haveFieldset = TenantsManager.Entities.status.get( 'haveFieldset' );
    const haveSchema = TenantsManager.Entities.status.get( 'haveSchema' );
    TenantsManager.Entities.ready( haveCollection && haveFieldset && haveSchema );
});
