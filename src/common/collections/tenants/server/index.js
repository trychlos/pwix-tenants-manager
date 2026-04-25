/*
 * pwix:tenants-manager/src/common/collections/tenants/server/index.js
 */

import { Tracker } from 'meteor/tracker';

import './functions.js';
import './methods.js';
import './publish.js';
import './transforms.js';

Tracker.autorun(( comp ) => {
    if( TenantsManager.Entities?.collectionReady.get() && TenantsManager.Records?.collectionReady.get()){
        TenantsManager.Tenants.ready( true );
        comp.stop();
    }
});
