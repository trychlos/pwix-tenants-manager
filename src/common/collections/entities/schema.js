/*
 * pwix:tenants-manager/src/common/collections/entities/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

Tracker.autorun(() => {
    const fieldSet = Entities.fieldSet?.get();
    if( Entities.collectionReady.get() && fieldSet ){
        Entities.collection.attachSchema( new SimpleSchema( fieldSet.toSchema()), { replace: true });
        Entities.collection.attachBehaviour( 'timestampable', { replace: true });
    }
});
