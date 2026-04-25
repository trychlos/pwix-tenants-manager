/*
 * pwix:tenants-manager/src/common/collections/tenants/ready.js
 *
 * Providers a ready() reactive data source both on the client and on the server.
 * 
 * By convention, Tenants is considered ready as soon as both Entities and Records collections are themselves ready.
 * On client-side, at end of common evaluation as there is no client-specific collection code.
 * On server-side, at end of server evaluation.
 */

import { Logger } from 'meteor/pwix:logger';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

const logger = Logger.get();

_ready = {
    value: false,
    dep: new Tracker.Dependency()
};

/**
 * @locus Anywhere
 * @summary Set/Get the readyness status of the 'Records' collection
 * @param {Boolean|none} b a status to be set when acting as a setter
 * @returns {Boolean} the current readyness status
 *  A reactive data source.
 */
Records.ready = function( b ){
    if( b !== undefined ){
        _ready.value = b;
        _ready.dep.changed();
    }
    _ready.dep.depend();
    return _ready.value;
}

Tracker.autorun(() => {
    logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.READY }, 'Records.ready()', Records.ready());
});
