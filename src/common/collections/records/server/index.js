/*
 * pwix:tenants-manager/src/common/collections/records/server/index.js
 */

import { Tracker } from 'meteor/tracker';

import './deny.js';
import './functions.js';
import './methods.js';
import './publish.js';

Tracker.autorun(() => {
    const haveCollection = TenantsManager.Records.status.get( 'haveCollection' );
    const haveFieldset = TenantsManager.Records.status.get( 'haveFieldset' );
    const haveSchema = TenantsManager.Records.status.get( 'haveSchema' );
    TenantsManager.Records.ready( haveCollection && haveFieldset && haveSchema );
});
