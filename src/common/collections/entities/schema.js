/*
 * pwix:tenants-manager/src/common/collections/entities/schema.js
 */

//import { CollectionBehaviours } from 'meteor/pwix:collection-behaviours';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

Tracker.autorun(() => {
    if( Entities.collectionReady.get()){
        Entities.collection.attachSchema( new SimpleSchema( Entities.fieldSet?.get().toSchema()), { replace: true });
        Entities.collection.attachBehaviour( 'timestampable', { replace: true });
        //CollectionBehaviours.attach( Entities.collection, 'timestampable', { replace: true });
    }
});
