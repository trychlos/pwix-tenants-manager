/*
 * pwix:tenants-manager/src/client/js/permissions.js
 *
 * Maintain in the TenantsManager global object the permissions as a ReactiveDict for the current user.
 * These permissions are only available on the client.
 */

import { ReactiveDict } from 'meteor/reactive-dict';
import { Roles } from 'meteor/pwix:roles';
import { Tracker } from 'meteor/tracker';

TenantsManager.perms = new ReactiveDict();

Tracker.autorun(() => {
    if( Roles.ready()){
        TenantsManager.perms.clear();
        const conf = TenantsManager.configure();
        Object.keys( conf.roles ).forEach(( role ) => {
            const roleName = conf.roles[role];
            if( roleName ){
                Tracker.autorun(() => {
                    TenantsManager.perms.set( role, Meteor.userId() && ( Roles.current().globals || [] ).includes( roleName ));
                });
            }
        });
    }
});
