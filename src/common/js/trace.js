/*
 * pwix:tenants-manager/src/common/js/trace.js
 */

_verbose = function( level ){
    if( TenantsManager.configure().verbosity & level ){
        let args = [ ...arguments ];
        args.shift();
        console.debug( 'pwix:tenants-manager', ...args );
    }
};

_trace = function( functionName ){
    _verbose( TenantsManager.C.Verbose.FUNCTIONS, ...arguments );
};
