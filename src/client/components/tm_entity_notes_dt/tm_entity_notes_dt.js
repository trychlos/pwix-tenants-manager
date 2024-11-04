/*
 * pwix:tenants-manager/src/client/components/tm_entity_notes_dt/tm_entity_notes_dt.js
 *
 * This template is used to display the notes indicator of the tenant entity.
 */

import { ReactiveVar } from 'meteor/reactive-var';

import { Entities } from '../../../common/collections/entities/index.js';

import './tm_entity_notes_dt.html';

Template.tm_entity_notes_dt.onCreated( function(){
    const self = this;

    self.TM = {
        entity: new ReactiveVar( null )
    };

    // get the entity
    self.autorun(() => {
        const item = Template.currentData().item;
        if( item ){
            Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { _id: item.entity }).then(( res ) => { res.length && self.TM.entity.set( res[0] ); });
        }
    });
});

Template.tm_entity_notes_dt.helpers({
    // the tenant entity notes indicator
    parmsNotes(){
        return {
            item: Template.instance().TM.entity.get(),
            field: Entities.fieldSet.get().byName( 'notes' )
        };
    }
});
