/*
 * pwix:tenants-manager/src/common/collections/entities/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - by Datatables, via pwix:tabular and aldeed:tabular
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 *
 * Note: in this multi-validities domain, the main tabular display is Entities-driven.
 * We so define in this fieldset some columns which are actually part of the Records fieldset, just to be displayed in the tabular list.
 */

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { Tracker } from 'meteor/tracker';

import { Entities } from './index.js';

const _defaultFieldSet = function( conf ){
    let columns = [
        // common notes
        Notes.fieldDef(),
        // timestampable behaviour
        {
            name: 'createdAt',
            schema: false,
            dt_visible: false
        },
        {
            name: 'createdBy',
            schema: false,
            dt_visible: false
        },
        {
            name: 'updatedAt',
            schema: false,
            dt_visible: false
        },
        {
            name: 'updatedBy',
            schema: false,
            dt_visible: false
        }
    ];
    return columns;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let columns = _defaultFieldSet( conf );
    let _fieldset = new Field.Set( columns );
    if( conf.entityFields ){
        _fieldset.extend( conf.entityFields );
    }
    Entities.fieldSet.set( _fieldset );
});
