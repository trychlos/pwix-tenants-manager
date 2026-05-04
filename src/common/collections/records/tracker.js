/*
 * pwix:tenants-manager/src/common/collections/records/tracker.js
 */

import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

// both collection and default fieldset depend of the configuration: have a single autorun
//  when the configure() reactive data source triggers this autorun, we have to rebuild all
Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    const collectionName = conf.tenantsCollection+'_r';
    check( collectionName, Match.NonEmptyString );
    if( collectionName !== Records.collectionName ){
        Records.collectionName = collectionName;
        Records.collection = new Mongo.Collection( collectionName );
        Records.status.set( 'haveCollection', true );
    }
    const fieldset = new Field.Set( Records._defaultFieldSet( conf ));
    Records.fieldSet.set( fieldset );
    Records.status.set( 'haveFieldset', true );
    Records.status.set( 'haveSchema', false );
});
