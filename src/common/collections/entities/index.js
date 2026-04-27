/*
 * pwix:tenants-manager/src/common/collections/entities/index.js
 */

import { Tracker } from 'meteor/tracker';

export { Entities } from './collection.js';

import './fieldset.js';
import './ready.js';

if( Meteor.isClient ){
    Tracker.autorun(() => {
        const haveCollection = TenantsManager.Entities.status.get( 'haveCollection' );
        const haveFieldset = TenantsManager.Entities.status.get( 'haveFieldset' );
        const haveSchema = TenantsManager.Entities.status.get( 'haveSchema' );
        TenantsManager.Entities.ready( haveCollection && haveFieldset && haveSchema );
    });
}
