/*
 * pwix:tenants-manager/src/common/collections/entities/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 *
 * Note: in this multi-validities domain, the main tabular display is Tenants-driven.
 * We do not define here the tabular display. See Tenants/fieldset for that.
 */

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { Timestampable } from 'meteor/pwix:collection-timestampable';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

const _defaultFieldSet = function( conf ){
    let columns = [
        // common notes
        Notes.fieldDef(),
        // timestampable behaviour
        Timestampable.fieldDef(),
        // validity fieldset,
        Validity.entitiesFieldDef()
    ];
    return columns;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let columns = _defaultFieldSet( conf );
    let fieldset = new Field.Set( columns );
    // add application-configured fieldset if any
    if( conf.entityFields ){
        fieldset.extend( conf.entityFields );
    }
    Entities.fieldSet.set( fieldset );
});
