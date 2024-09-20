/*
 * pwix:tenants-manager/src/client/components/entity_validities_pane/entity_validities_pane.js
 *
 * Manages a ValidityTabbed tabbed pane, where each pane is a validity period.
 *
 * Parms:
 * - item: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Entities } from '../../../common/collections/entities/index.js';

import './entity_validities_pane.html';

Template.entity_validities_pane.onCreated( function(){
    const self = this;

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.entity_validities_pane.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker?.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                data: {
                    item: Template.currentData().item
                }
            }));
        }
    });
});

Template.entity_validities_pane.helpers({
    // manage the ValidityTabbed panel
    parmsValidities(){
        return {
            ...this,
            checker: Template.instance().TM.checker,
            name: 'tenants_manager_entity_validities'
        };
    }
});

Template.entity_validities_pane.events({
    // edit the managers
    'click .js-edit-managers'( event, instance ){
        const self = this;
        Modal.run({
            mdBody: 'accounts_select',
            mdButtons: [{ id: Modal.C.Button.NEW, classes: 'btn-outline-primary me-auto' }, Modal.C.Button.CANCEL, { id: Modal.C.Button.OK, type: 'submit' }],
            mdClasses: 'modal-lg',
            mdClassesContent: Meteor.TM.Pages.current.page().get( 'theme' ),
            mdTitle: pwixI18n.label( I18N, 'organizations.properties.managers_modal' ),
            selected: self.item.get().DYN.managers || [],
            update( selected ){
                // get the item updated
                self.item.get().DYN.managers = selected;
                // get the form updated
                instance.TM.form.get().setField( 'managers', self.item.get());
                // advertize parents
                instance.$( '.c-organization-properties-pane' ).trigger( 'panel-data', {
                    emitter: 'managers',
                    id: self.vtpid,
                    ok: true,
                    data: selected
                });
            }
        });
    },

    // input checks
    'input .c-organization-properties-pane'( event, instance ){
        const dataContext = this;
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            instance.TM.form.get().inputHandler( event ).then(( valid ) => { instance.TM.sendPanelData( dataContext, valid ); });
        }
    },

    // ask for clear the panel
    'iz-clear-panel .c-organization-properties-pane'( event, instance ){
        instance.TM.form.get().clear();
    }
});
