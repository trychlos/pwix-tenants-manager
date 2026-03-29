/*
 * pwix:tenants-manager/src/common/collections/records/schema.js
 */

import SimpleSchema from 'meteor/aldeed:simple-schema';

import { Logger } from 'meteor/pwix:logger';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

const logger = Logger.get();

Tracker.autorun(() => {
    const fieldSet = Records.fieldSet?.get();
    if( Records.collectionReady.get() && fieldSet ){
        if( Records.collection.attachSchema ){
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, '[INFO] attaching schema to Records.collection' );
            Records.collection.attachSchema( new SimpleSchema( fieldSet.toSchema()), { replace: true });
            Records.collection.attachBehaviour( 'timestampable', { replace: true });
        } else {
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, '[WARN] Records.collection.attachSchema is not a function' );
        }
    }
});
