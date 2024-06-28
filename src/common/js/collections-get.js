/*
 * pwix:tenants-manager/src/common/js/collections-get.js
 */

import { Mongo } from 'meteor/mongo';

TenantsManager.collections = {
    managed: {},

    /**
     * returns the named collection, maybe instanciating it if needed
     * @param {String} name
     * @returns {Mongo.Collection}
     */
    get( name ){
        const side = Meteor.isClient ? 'client' : 'server';
        let res = this.managed[name] && this.managed[name][side];
        if( !res ){
            this.managed[name] = this.managed[name] || {};
            this.managed[name][side] = new Mongo.Collection( name );
            res = this.managed[name][side];
        }
        return res;
    }
};
