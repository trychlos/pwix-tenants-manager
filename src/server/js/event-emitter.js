/*
 * pwix:tenants-manager/src/server/js/event-emitter.js
 */

import EventEmitter from 'node:events';

TenantsManager.s = TenantsManager.s || {};

TenantsManager.s.eventEmitter = new EventEmitter();
