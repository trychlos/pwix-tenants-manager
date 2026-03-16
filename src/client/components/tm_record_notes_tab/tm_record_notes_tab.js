/*
 * pwix:tenants-manager/src/client/components/tm_record_notes_tab/tm_record_notes_tab.js
 *
 * Edit the notes of the tenant's entity.
 *
 * Parms:
 * - item: the record to edit as a ReactiveVar
 * - checker: the parent Checker which manages the dialog
 */

import { Logger } from 'meteor/pwix:logger';

import { Records } from '../../../common/collections/records/index.js';

import './tm_record_notes_tab.html';

const logger = Logger.get();

Template.tm_record_notes_tab.helpers({
    // parms for NotesEdit
    parmsNotes(){
        return {
            item: this.item.get(),
            field: Records.fieldSet.get().byName( 'notes' )
        }
    }
});

Template.tm_record_notes_tab.events({
    'notes-data .tm-record-notes-tab'( event, instance, data ){
        const item = this.item?.get();
        const checker = this.checker?.get();
        if( item && checker ){
            checker.setUpdated();
        }
    }
});
