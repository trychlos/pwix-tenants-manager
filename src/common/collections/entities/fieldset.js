/*
 * pwix:tenants-manager/src/common/collections/entities/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 *
 * Note: in this multi-validities domain, the main tabular display is record-driven.
 * We do not define here the tabular display. See Records/fieldset for that.
 */

import { Field } from 'meteor/pwix:field';
import { Logger } from 'meteor/pwix:logger';
import { Notes } from 'meteor/pwix:notes';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Timestampable } from 'meteor/pwix:collection-timestampable';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Entities } from './index.js';

const logger = Logger.get();

Entities._defaultFieldSet = function( conf ){
    let columns = [
        // common notes
        Notes.fieldDef()
    ];
    // validity fieldset,
    columns = columns.concat( Validity.entitiesFieldDef());
    // timestampable behaviour
    columns = columns.concat( Timestampable.fieldDef());
    return columns;
};

// fieldset has changed -> dependants have to be reset
let countSchema = 0;
Tracker.autorun(() => {
    const fieldset = Entities.fieldSet.get();
    const haveCollection = Entities.status.get( 'haveCollection' );
    if( fieldset && haveCollection ){
        if( Entities.collection.attachSchema ){
            countSchema += 1;
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, 'attaching Entities schema' );
            Entities.collection.attachSchema( new SimpleSchema( fieldset.toSchema()), { replace: true });
            //logger.debug( 'attaching new schema', countSchema, Entities.collection.simpleSchema());
            Entities.collection.attachBehaviour( 'timestampable', { replace: true });
            Entities.status.set( 'haveSchema', true );
        } else {
            logger.warning( 'Entities.collection.attachSchema is not a function' );
        }
    }
});

Tracker.autorun(() => {
    //logger.debug( 'Entities.fieldSet', Entities.fieldSet.get().names());
});
