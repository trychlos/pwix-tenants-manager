/*
 * pwix:tenants-manager/src/client/js/permissions.js
 *
 * Maintain in the TenantsManager global object the permissions as a ReactiveDict for the current user.
 * These permissions are only available on the client.
 * Note that at this TenantsManager level, we consider that roles must no be scoped (and so only look at global - non-scoped - roles).
 */

import { ReactiveDict } from 'meteor/reactive-dict';
import { Roles } from 'meteor/pwix:roles';
import { Tracker } from 'meteor/tracker';

TenantsManager.perms = new ReactiveDict();

Tracker.autorun(() => {
    if( Roles.ready()){
        TenantsManager.perms.clear();
        if( Meteor.userId()){
            const conf = TenantsManager.configure();
            Object.keys( conf.roles ).forEach(( name ) => {
                const roleId = conf.roles[name];
                if( roleId ){
                    Tracker.autorun(() => {
                        TenantsManager.perms.set( name, Roles.current().global.all.includes( roleId ));
                    });
                }
            });
        }
    }
});
