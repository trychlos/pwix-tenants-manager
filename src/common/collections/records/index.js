/*
 * pwix:tenants-manager/src/common/collections/records/index.js
 */

import { Tracker } from 'meteor/tracker';

export { Records } from './collection.js';

import './fieldset.js';
import './ready.js';
import './tracker.js';

if( Meteor.isClient ){
    Tracker.autorun(() => {
        const haveCollection = TenantsManager.Records.status.get( 'haveCollection' );
        const haveFieldset = TenantsManager.Records.status.get( 'haveFieldset' );
        const haveSchema = TenantsManager.Records.status.get( 'haveSchema' );
        TenantsManager.Records.ready( haveCollection && haveFieldset && haveSchema );
    });
}
