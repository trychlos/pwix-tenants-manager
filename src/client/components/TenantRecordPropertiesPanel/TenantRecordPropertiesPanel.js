/*
 * /imports/client/components/TenantRecordPropertiesPanel/TenantRecordPropertiesPanel.js
 *
 * Tenant properties pane.
 * Edit here the label, the emails, the URLs, the logo
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the edited record
 * - checker: the Forms.Checker which manages the parent component
 * - enableChecks: whether the checks should be enabled at startup, defaulting to true
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { Tenants } from '../../../common/collections/tenants/index.js';
import { Records } from '../../../common/collections/records/index.js';

import '../tm_emails_thead/tm_emails_thead.js';
import '../tm_urls_thead/tm_urls_thead.js';

import './TenantRecordPropertiesPanel.html';

const logger = Logger.get();

Template.TenantRecordPropertiesPanel.onCreated( function(){
    const self = this;

    self.TM = {
        min_fields: {
            label: {
                js: '.js-label'
            },
            /*
            managers: {
                js: '.js-managers',
                val( item ){
                    let emails = [];
                    ( item.DYN?.managers || [] ).every(( o ) => {
                        emails.push( o.emails[0].address );
                        return true;
                    });
                    return emails.join( ', ' );
                },
                type: 'INFO'
            },
            */
            logoUrl: {
                js: '.js-logo'
            }
        },
        dedicated_url_fields: {
            homeUrl: {
                js: '.js-home'
            }
        },
        dedicated_email_fields: {
            contactEmail: {
                js: '.js-contact-email'
            }
        },
        // depends of the configuration
        hasDedicatedEmails: new ReactiveVar( false ),
        hasDedicatedUrls: new ReactiveVar( false ),
        hasGeneralizedEmails: new ReactiveVar( false ),
        hasGeneralizedUrls: new ReactiveVar( false ),
        // all edited fields depending of the configuration
        fields: new ReactiveVar( null ),
        // the Checker instance
        checker: new ReactiveVar( null ),

        // advertise of the checker status
        advertise( checker ){
            const status = checker.status();
            const validity = checker.validity();
            self.$( '.TenantRecordPropertiesPanel' ).trigger( 'iz-checker', { status: status, validity: validity });
        }
    };

    // build the needed values from the package configuration
    self.autorun(() => {
        const conf = TenantsManager.configure();
        let fields = self.TM.min_fields;
        // has dedicated emails ?
        if( conf.withDedicatedEmails ){
            self.TM.hasDedicatedEmails.set( true );
            fields = _.merge( fields, self.TM.dedicated_email_fields );
        }
        // has dedicated urls ?
        if( conf.withDedicatedUrls ){
            self.TM.hasDedicatedUrls.set( true );
            fields = _.merge( fields, self.TM.dedicated_url_fields );
        }
        // has generalized emails ?
        if( conf.withGeneralizedEmails ){
            self.TM.hasGeneralizedEmails.set( true );
        }
        // has generalized urls ?
        if( conf.withGeneralizedUrls ){
            self.TM.hasGeneralizedUrls.set( true );
        }
        //logger.debug( 'fields', fields );
        self.TM.fields.set( fields );
    });
});

Template.TenantRecordPropertiesPanel.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        if( dataContext.index < dataContext.entity.get().DYN.records.length ){
            const parentChecker = dataContext.checker?.get();
            let checker = self.TM.checker.get();
            if( parentChecker && !checker && !running ){
                running = true;
                Tracker.nonreactive(() => {
                    checker = new Forms.Checker( self );
                    checker.init({
                        parentChecker: parentChecker,
                        panel: {
                            fields: self.TM.fields.get(),
                            set: Records.fieldSet.get()
                        },
                        data: {
                            entity: dataContext.entity,
                            index: dataContext.index
                        },
                        enabled: dataContext.enableChecks !== false,
                        crossCheckRegisterFn: Tenants.checks.crossCheck_Properties
                    }).then(() => {
                        self.TM.checker.set( checker );
                    })
                });
            }
        } else {
            self.TM.checker.set( null );
            comp.stop();
        }
    });

    // setup the form with current data context
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        const checker = self.TM.checker.get();
        if( checker && dataContext.index < dataContext.entity.get().DYN.records.length ){
            checker.setForm( dataContext.entity.get().DYN.records[dataContext.index].get());
            comp.stop();
        }
    });

    // advertise the assistant of the status of this panel
    self.autorun(() => {
        const checker = self.TM.checker.get();
        if( checker ){
            self.TM.advertise( checker );
        }
    });
});

Template.TenantRecordPropertiesPanel.helpers({
    // whether we want use dedicated emails
    haveDedicatedEmails(){
        return Template.instance().TM.hasDedicatedEmails.get();
    },

    // whether we want use dedicated urls
    haveDedicatedUrls(){
        return Template.instance().TM.hasDedicatedUrls.get();
    },

    // whether we want use generalized emails
    haveGeneralizedEmails(){
        const recordsArray = this.entity.get().DYN.records;
        if( this.index < recordsArray.length ){
            return Template.instance().TM.hasGeneralizedEmails.get();
        }
        return false;
    },

    // whether we want use generalized urls
    haveGeneralizedUrls(){
        const recordsArray = this.entity.get().DYN.records;
        if( this.index < recordsArray.length ){
            return Template.instance().TM.hasGeneralizedUrls.get();
        }
        return false;
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // for label
    itFor( label ){
        return 'record_properties_'+label+'_'+this.index;
    },

    // parms for tm_emails_thead
    parmsEmails(){
        const haveOne = !Template.instance().TM.hasDedicatedEmails.get();
        return {
            ...this,
            haveOne
        }
    },

    // parms for ImageIncluder
    parmsImage(){
        const recordsArray = this.entity.get().DYN.records;
        if( this.index < recordsArray.length ){
            return {
                imageUrl: recordsArray[this.index].get().logoUrl
            }
        }
        return null;
    },

    // parms for tm_urls_thead
    parmsUrls(){
        const haveOne = false;
        return {
            ...this,
            haveOne
        }
    },
});

Template.TenantRecordPropertiesPanel.events({
    // ask for clear the panel
    'image-includer-url .TenantRecordPropertiesPanel'( event, instance, data ){
        const recordsArray = this.entity.get().DYN.records;
        if( this.index < recordsArray.length ){
            const recordRv = recordsArray[this.index];
            const record = recordRv.get();
            record.logoUrl = data.url;
            recordRv.set( record );
            const checker = instance.TM.checker.get();
            if( checker ){
                checker.setForm( record );
                checker.check({ update: false });
            }
        }
    },

    // ask for clear the panel
    'iz-clear-panel .TenantRecordPropertiesPanel'( event, instance ){
        instance.TM.checker.get().clearForm();
    },

    // ask for enabling the checker (when this panel is used inside of an assistant)
    'iz-enable-checks .TenantRecordPropertiesPanel'( event, instance, enabled ){
        const checker = instance.TM.checker.get();
        if( checker ){
            checker.enabled( enabled );
            if( enabled ){
                checker.check({ update: false }).then(() => { instance.TM.advertise( checker ); });
            }
        }
        return false;
    }
});

Template.TenantRecordPropertiesPanel.onDestroyed( function(){
    //logger.debug( 'onDestroyed()' );
});
