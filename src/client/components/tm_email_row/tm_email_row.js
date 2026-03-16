/*
 * pwix:tenants-manager/src/client/components/tm_email_row/tm_email_row.js
 *
 * Manage an email address, maybe empty but have at least an id.
 *
 * Parms (when editing the email addresses):
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the currently edited client record
 * - checker: a ReactiveVar which holds the parent Checker
 * - it: the email item to be managed here
 *
 * Parms (when showing all the email addresses):
 * - edit: false
 * - it: the email item to be managed here
 */

import _ from 'lodash';
import { strict as assert } from 'node:assert';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tracker } from 'meteor/tracker';

import { Records } from '../../../common/collections/records/index.js';
import { Tenants } from '../../../common/collections/tenants/index.js';

import './tm_email_row.html';

const logger = Logger.get();

Template.tm_email_row.onCreated( function(){
    const self = this;

    self.TM = {
        fields: {
            'emails.$.label': {
                js: '.js-label'
            },
            'emails.$.email': {
                js: '.js-email'
            }
        },
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),

        // reactively remove the item
        removeById( id ){
            const recordRv = Template.currentData().entity.get().DYN.records[Template.currentData().index];
            let item = recordRv.get();
            let rows = item.emails || [];
            let found = -1;
            for( let i=0 ; i<rows.length ; ++i ){
                if( rows[i]._id === id ){
                    found = i;
                    break;
                }
            }
            if( found !== -1 ){
                rows.splice( found, 1 );
                recordRv.set( item );
                self.TM.checker.get().removeMe();
            } else {
                logger.warn( id, 'not found', item );
                const trs = self.$( 'tr.tm-email-row' ).closest( 'table' ).children( 'tr' );
                $.each( trs, function( index, object ){
                    logger.debug( index, $( object ).data( 'item-id' ));
                });
            }
        }
    };
});

Template.tm_email_row.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    // nb: this same template is used both for editing the email addresses and for displaying them
    //  have different initializations in these two cases
    //  though we must still wait for the data context be available
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        const displaying = ( dataContext.edit === false );
        const keys = Object.keys( dataContext );
        const editing = keys.includes( 'index' ) && keys.includes( 'entity' ) && keys.includes( 'checker' );
        let checker = self.TM.checker.get();
        const parentChecker = dataContext.checker?.get();
        if(( displaying || editing ) && !checker && ( !editing || ( dataContext.index < dataContext.entity.get().DYN.records.length && parentChecker )) && !running ){
            running = true;
            Tracker.nonreactive(() => {
                checker = new Forms.Checker( self );
                let p = null;
                if( displaying ){
                    p = checker.init({
                        check: false,
                        panel: {
                            fields: self.TM.fields,
                            set: Records.fieldSet.get()
                        },
                        rowId: dataContext.it._id
                    });
                }
                if( editing ){
                    p = checker.init({
                        parentChecker: parentChecker,
                        name: 'tm_email_row',
                        panel: {
                            fields: self.TM.fields,
                            set: Records.fieldSet.get()
                        },
                        data: {
                            entity: dataContext.entity,
                            index: dataContext.index
                        },
                        rowId: dataContext.it._id,
                        crossCheckRegisterFn: Tenants.checks.email_row
                    });
                }
                p.then(() => {
                        self.TM.checker.set( checker );
                        comp.stop();
                        logger.debug( 'dataContext', dataContext );
                    });
            });
        }
    });

    // set up the form on data context changes
    self.autorun(() => {
        const dataContext = Template.currentData();
        const checker = self.TM.checker.get();
        if( checker ){
            const opts = {};
            if( dataContext.edit === false ){
                opts.check = false;
            }
            checker.setForm( dataContext.it, opts );
        }
    });
});

Template.tm_email_row.helpers({
    // whether we are editing ?
    editing(){
        return this.edit !== false;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // note: weird things happen when inserting/deleting rows, unless we delete only last row
    // but we accept to remove all rows
    minusEnabled(){
        return '';
    }
});

Template.tm_email_row.events({
    'click .tm-email-row .js-minus'( event, instance ){
        const id = this.it._id;
        instance.TM.removeById( id );
    },
});

Template.tm_email_row.onDestroyed( function(){
    //console.debug( 'onDestroyed', Template.currentData().it.id );
});
