/*
 * pwix:tenants-manager/src/common/js/event-emitter.js
 *
 * This is installed in common code, though protected to run only server side, to be available when initializing the tenants list.
 */

import EventEmitter from 'node:events';

if( Meteor.isServer ){
    TenantsManager.s = TenantsManager.s || {};
    TenantsManager.s.eventEmitter = new EventEmitter();
}
