/*
 * pwix:tenants-manager/src/common/collections/entities/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';

import { Logger } from 'meteor/pwix:logger';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

const logger = Logger.get();

Tracker.autorun(() => {
    const fieldSet = Entities.fieldSet.get();
    if( Entities.ready() && fieldSet ){
        if( Entities.collection.attachSchema ){
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, '[INFO] attaching schema to Entities.collection' );
            Entities.collection.attachSchema( new SimpleSchema( fieldSet.toSchema()), { replace: true });
            Entities.collection.attachBehaviour( 'timestampable', { replace: true });
        } else {
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, '[WARN] Entities.collection.attachSchema is not a function' );
        }
    }
});
