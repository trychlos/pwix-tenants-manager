/*
 * pwix:tenants-manager/src/client/components/tm_entity_notes_tab/tm_entity_notes_tab.js
 *
 * Edit the notes of the tenant's entity.
 *
 * Parms:
 * - item: the record to edit as a ReactiveVar
 * - checker: the parent Checker which manages the dialog
 */

import { Logger } from 'meteor/pwix:logger';

import { Entities } from '../../../common/collections/entities/index.js';

import './tm_entity_notes_tab.html';

const logger = Logger.get();

Template.tm_entity_notes_tab.helpers({
    // parms for NotesEdit
    parmsNotes(){
        return {
            ...this,
            field: Entities.fieldSet.get().byName( 'notes' )
        }
    }
});

Template.tm_entity_notes_tab.events({
    'notes-data .tm-entity-notes-tab'( event, instance, data ){
        const item = this.item?.get();
        const checker = this.checker?.get();
        if( item && checker ){
            checker.setUpdated();
        }
    }
});
