/*
 * pwix:tenants-manager/src/common/collections/tenants/server/index.js
 */

import { Tracker } from 'meteor/tracker';

import './functions.js';
import './methods.js';
import './publish.js';
import './transforms.js';

Tracker.autorun(( comp ) => {
    if( TenantsManager.Entities?.ready() && TenantsManager.Records?.ready()){
        TenantsManager.Tenants.ready( true );
        comp.stop();
    }
});
