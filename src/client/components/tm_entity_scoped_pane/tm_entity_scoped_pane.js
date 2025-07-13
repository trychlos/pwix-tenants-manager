/*
 * pwix:tenants-manager/src/client/components/tm_entity_scoped_pane/tm_entity_scoped_pane.js
 *
 * Edit the scoped roles for this tenant.
 * This is only allowed to the scopedManagerRole role.
 *
 * Parms:
 * - entity: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker which manages the dialog
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Entities } from '../../../common/collections/entities/index.js';

import './tm_entity_scoped_pane.html';

Template.tm_entity_scoped_pane.onCreated( function(){
    const self = this;

    self.TM = {
        allowed: new ReactiveVar( false )
    };

    // check if the user is not allowed
    self.autorun(() => {
        TenantsManager.isAllowed( 'pwix.tenants_manager.feat.roles', Meteor.userId(), Template.currentData().entity.get()._id ).then(( res ) => { self.TM.allowed.set( res ); });
    });
});

Template.tm_entity_scoped_pane.onRendered( function(){
    const self = this;

    // disable this tab (if any) if the user is not allowed
    self.autorun(() => {
        const allowed = self.TM.allowed.get();
        const $pane = self.$( '.tm-entity-scoped-pane' ).closest( '.tab-pane' );
        if( $pane && $pane.length ){
            const name = $pane.data( 'tabbed-tab-name' );
            if( name ){
                self.$( '.tm-entity-scoped-pane' ).trigger( 'assistant-do-enable-tab', { name: name, enabled: allowed });
            }
        }
    });
});

Template.tm_entity_scoped_pane.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // parms for prAccountsPanel
    // item can be null when defining a new tenant
    parmsAccountsPanel(){
        return {
            scope: this.item?._id || null
        };
    }
});
