/*
 * pwix:tenants-manager/src/common/collections/entities/index.js
 */

import { Tracker } from 'meteor/tracker';

export { Entities } from './collection.js';

import './fieldset.js';
import './ready.js';
import './schema.js';

if( Meteor.isClient ){
    Tracker.autorun(( comp ) => {
        Entities.ready( true );
        comp.stop();
    });
}
