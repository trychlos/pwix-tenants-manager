/*
 * pwix:tenants-manager/src/common/collections/records/index.js
 */

import { Tracker } from 'meteor/tracker';

export { Records } from './collection.js';

import './fieldset.js';
import './ready.js';
import './schema.js';

if( Meteor.isClient ){
    Tracker.autorun(( comp ) => {
        Records.ready( true );
        comp.stop();
    });
}
