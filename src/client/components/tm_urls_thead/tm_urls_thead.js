/*
 * pwix:tenants-manager/src/client/components/tm_urls_thead/tm_urls_thead.js
 *
 * Manage the URLs attached to the tenant.
 * 
 * From HTML point of view, this template inserts inside of a three-columns table
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the currently edited Client record
 * - checker: a ReactiveVar which holds the parent Checker
 * - haveOne: whether to provide an empty row at initialization when there is not yet any url url, defaulting to true
 * - enableChecks: whether the checks should be enabled at startup, defaulting to true
 */

import _ from 'lodash';
import { strict as assert } from 'node:assert';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import '../tm_email_row/tm_email_row.js';

import './tm_urls_thead.html';

const logger = Logger.get();

Template.tm_urls_thead.onCreated( function(){
    const self = this;

    self.TM = {
        // current count of urls
        count: new ReactiveVar( 0 ),
        // the Form.Checker instance for this panel
        checker: new ReactiveVar( null ),
        // whether we already have added one empty row at startup
        haveAddedOne: false,

        // add an empty item to the urls array
        addOne( dataContext ){
            const recordRv = dataContext.entity.get().DYN.records[dataContext.index];
            const item = recordRv.get();
            item.emails = item.emails || [];
            item.emails.push({
                _id: Random.id()
            });
            recordRv.set( item );
            //logger.debug( 'addOne()', item );
            self.TM.haveAddedOne = true;
        },

        // advertise of the checker validity
        advertise( checker ){
            const status = checker.status();
            const validity = checker.validity();
            self.$( '.tm-urls-thead' ).trigger( 'iz-checker', { status: status, validity: validity });
        },

        // count empty rows
        countEmpty( dataContext ){
            const record = dataContext.entity.get().DYN.records[dataContext.index].get();
            let count = 0;
            for( const it of ( record.urls || [] )){
                if( !it.label && !it.url ){
                    count += 1;
                }
            }
            return count;
        }
    };

    // keep the count of rows up to date
    self.autorun(() => {
        const entity = Template.currentData().entity.get();
        const index = Template.currentData().index;
        self.TM.count.set(( entity.DYN.records[index].get().urls || [] ).length );
    });
});

Template.tm_urls_thead.onRendered( function(){
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
                    name: 'tm_urls_thead',
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
        if( !self.TM.count.get()){
            const haveOne = Template.currentData().haveOne !== false;
            if( haveOne && !self.TM.haveAddedOne ){
                self.TM.addOne( Template.currentData());
            }
        }
    });
});

Template.tm_urls_thead.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // emails list
    itemsList(){
        const count = Template.instance().TM.count.get();
        const list = this.entity.get().DYN.records[this.index].get().urls || [];
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
    plusDisabled(){
        const checker = Template.instance().TM.checker.get();
        const valid = checker ? checker.validity() : false;
        const emptyCount = Template.instance().TM.countEmpty( this );
        return valid && emptyCount === 0 ? '' : 'disabled';
    }
});

Template.tm_urls_thead.events({
    // ask for enabling the checker (when this panel is used inside of an assistant)
    'iz-enable-checks .tm-urls-thead'( event, instance, enabled ){
        logger.debug( event );
        const checker = instance.TM.checker.get();
        if( checker ){
            checker.enabled( enabled );
            if( enabled ){
                 checker.check({ update: false }).then(() => { instance.TM.advertise( checker ); });
            }
        }
        return false;
    },
    'click .tm-urls-thead .js-plus'( event, instance ){
        logger.debug( event );
        instance.TM.addOne( this );
    }
});
