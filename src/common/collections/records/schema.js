/*
 * pwix:tenants-manager/src/common/collections/records/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

Tracker.autorun(() => {
    if( Records.collectionReady.get()){
        Records.collection.attachSchema( new SimpleSchema( Records.fieldSet?.get().toSchema()), { replace: true });
        Records.collection.attachBehaviour( 'timestampable', { replace: true });
    }
});
