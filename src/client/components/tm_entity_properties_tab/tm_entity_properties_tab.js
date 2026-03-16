/*
 * pwix:tenants-manager/src/client/components/tm_entity_properties_tab/tm_entity_properties_tab.js
 *
 * Edit the common part of the tenant's entity.
 *
 * Parms:
 * - item: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker which manages the dialog
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { Entities } from '../../../common/collections/entities/index.js';

import './tm_entity_properties_tab.html';

Template.tm_entity_properties_tab.onCreated( function(){
    const self = this;

    self.TM = {
        fields: {
            label: {
                js: '.js-label'
            }
        },
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.tm_entity_properties_tab.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        const parentChecker = dataContext.checker?.get();
        let checker = self.TM.checker.get();
        if( parentChecker && !checker && !running ){
            running = true;
            Tracker.nonreactive(() => {
                checker = new Forms.Checker( self );
                checker.init({
                    parentChecker: parentChecker,
                    panel: {
                        fields: self.TM.fields,
                        set: Entities.fieldSet.get()
                    },
                    data: {
                        item: dataContext.item
                    }
                }).then(() => {
                    self.TM.checker.set( checker );
                    comp.stop();
                });
            });
        }
    });
});

Template.tm_entity_properties_tab.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // for label
    itFor( label ){
        return 'entity_properties_'+label;
    }
});
