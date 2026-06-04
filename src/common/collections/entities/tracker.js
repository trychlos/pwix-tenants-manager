/*
 * pwix:tenants-manager/src/common/collections/entities/tracker.js
 */

import { check, Match } from 'meteor/check';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

// both collection and default fieldset depend of the configuration: have a single autorun
//  when the configure() reactive data source triggers this autorun, we have to rebuild all
Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    const collectionName = conf.tenantsCollection+'_e';
    check( collectionName, Match.NonEmptyString );
    if( collectionName !== Entities.collectionName ){
        Entities.collectionName = collectionName;
        Entities.collection = new Mongo.Collection( collectionName );
        Entities.status.set( 'haveCollection', true );
    }
    const fieldset = new Field.Set( Entities._defaultFieldSet( conf ));
    Entities.fieldSet.set( fieldset );
    Entities.status.set( 'haveFieldset', true );
    Entities.status.set( 'haveSchema', false );
});
