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

const _defaultFieldSet = function( conf ){
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

Tracker.autorun(() => {
    // fieldset has changed or is to be initialized
    const conf = TenantsManager.configure();
    let fieldset = Entities.fieldSet.get();
    if( !fieldset ){
        const columns = _defaultFieldSet( conf );
        fieldset = new Field.Set( columns );
    }
    // define dependants
    if( Entities.collection?.attachSchema ){
        logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, 'attaching Entities schema' );
        Entities.collection.attachSchema( new SimpleSchema( fieldset.toSchema()), { replace: true });
        Entities.collection.attachBehaviour( 'timestampable', { replace: true });
    } else if( !Entities.collection ){
        logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, 'Entities.collection is not (yet ?) defined' );
    } else {
        logger.warning( 'Entities.collection.attachSchema is not a function' );
    }
    // set the reactive var
    Entities.fieldSet.set( fieldset );
});

Tracker.autorun(() => {
    //logger.debug( 'Entities.fieldSet', Entities.fieldSet.get());
});
