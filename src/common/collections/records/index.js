/*
 * pwix:tenants-manager/src/common/collections/records/index.js
 */

import { Tracker } from 'meteor/tracker';

export { Records } from './collection.js';

import './fieldset.js';
import './ready.js';

if( Meteor.isClient ){
    Tracker.autorun(( comp ) => {
        TenantsManager.Records.ready( true );
        comp.stop();
    });
}
