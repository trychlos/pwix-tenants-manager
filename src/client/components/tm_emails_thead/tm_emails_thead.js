/*
 * pwix:tenants-manager/src/client/components/tm_emails_thead/tm_emails_thead.js
 *
 * Manage the email addresses attached to the tenant.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the currently edited Client record
 * - checker: a ReactiveVar which holds the parent Checker
 * - haveOne: whether to provide an empty row at initialization when there is not yet any email, defaulting to true
 * - enableChecks: whether the checks should be enabled at startup, defaulting to true
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import '../tm_email_row/tm_email_row.js';

import './tm_emails_thead.html';

const logger = Logger.get();

Template.tm_emails_thead.onCreated( function(){
    const self = this;

    self.TM = {
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),
        // whether we already have added one empty row at startup
        haveAddedOne: false,

        // add an empty item to the array
        addOne( dataContext ){
            const recordRv = dataContext.entity.get().DYN.records[dataContext.index];
            const item = recordRv.get();
            item.emails = item.emails || [];
            item.emails.push({
                _id: Random.id()
            });
            recordRv.set( item );
            self.TM.haveAddedOne = true;
        },

        // advertise of the checker validity
        advertise( checker ){
            const status = checker.status();
            const validity = checker.validity();
            self.$( '.tm-emails-thead' ).trigger( 'iz-checker', { status: status, validity: validity });
        },

        // count empty rows
        countEmpty( dataContext ){
            const record = dataContext.entity.get().DYN.records[dataContext.index].get();
            let count = 0;
            for( const it of ( record.emails || [] )){
                if( !it.label && !it.email ){
                    count += 1;
                }
            }
            return count;
        },

        // count set rows
        countSet( dataContext ){
            const record = dataContext.entity.get().DYN.records[dataContext.index].get();
            let count = 0;
            for( const it of ( record.emails || [] )){
                if( it.label && it.email ){
                    count += 1;
                }
            }
            return count;
        }
    };

    // track the count of emails
    //self.autorun(() => {
    //    const dataContext = Template.currentData();
    //    const record = dataContext.entity.get().DYN.records[dataContext.index].get();
    //    logger.warning( 'emails count', record.emails.length );
    //});
});

Template.tm_emails_thead.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        const parentChecker = Template.currentData().checker?.get();
        let checker = self.TM.checker.get();
        if( parentChecker && !checker && !running ){
            running = true;
            Tracker.nonreactive(() => {
                checker = new Forms.Checker( self );
                checker.init({
                    name: 'tm_emails_thead',
                    parentChecker: parentChecker,
                    enabled: dataContext.enableChecks !== false
                }).then(() => {
                    self.TM.checker.set( checker );
                    comp.stop();
                });
            });
        }
    });

    // if no email yet, and not configured to not to, have an empty row
    self.autorun(() => {
        const dataContext = Template.currentData();
        const entity = dataContext.entity.get();
        if( entity ){
            const count = self.TM.countSet( dataContext );
            if( !count && dataContext.haveOne !== false && !self.TM.haveAddedOne ){
                self.TM.addOne( dataContext );
            }
        }
    });
});

Template.tm_emails_thead.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails list
    itemsList(){
        const list = this.entity.get().DYN.records[this.index].get().emails || [];
        return list;
    },

    // passes the same data context, just replacing the parent checker by our own
    parmsRow( it ){
        const parms = { ...this };
        parms.checker = Template.instance().TM.checker;
        parms.it = it;
        return parms;
    },

    // whether the plus button is enabled
    //  we accept only one empty row
    //  we must stay under the max configured count
    plusDisabled(){
        const checker = Template.instance().TM.checker.get();
        const valid = checker ? checker.validity() : false;
        const emptyCount = Template.instance().TM.countEmpty( this );
        const setCount = Template.instance().TM.countSet( this );
        return ( valid && emptyCount === 0 ) ? '' : 'disabled';
    }
});

Template.tm_emails_thead.events({
    // ask for enabling the checker (when this panel is used inside of an assistant)
    'iz-enable-checks .tm-emails-thead'( event, instance, enabled ){
        //logger.debug( event );
        const checker = instance.TM.checker.get();
        if( checker ){
            checker.enabled( enabled );
            if( enabled ){
                 checker.check({ update: false }).then(() => { instance.TM.advertise( checker ); });
            }
        }
        return false;
    },
    'click .tm-emails-thead .js-plus'( event, instance ){
        //logger.debug( event );
        instance.TM.addOne( this );
    }
});
