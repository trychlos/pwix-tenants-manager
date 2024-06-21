Package.describe({
    name: 'pwix:tenants-manager',
    version: '1.0.0-rc',
    summary: 'A Meteor package to manage tenants with validity periods',
    git: 'https://github.com/trychlos/pwix-tenants-manager',
    documentation: 'README.md'
});

Package.onUse( function( api ){
    configure( api );
    api.export([
        'TenantsManager'
    ]);
    api.mainModule( 'src/client/js/index.js', 'client' );
    api.mainModule( 'src/server/js/index.js', 'server' );
});

Package.onTest( function( api ){
    configure( api );
    api.use( 'tinytest' );
    api.use( 'pwix:tenants-manager' );
    api.mainModule( 'test/js/index.js' );
});

function configure( api ){
    api.versionsFrom([ '2.9.0', '3.0-rc.0' ]);
    api.use( 'aldeed:collection2@4.0.1' );
    api.use( 'aldeed:simple-schema@1.13.1' );
    api.use( 'blaze-html-templates@2.0.0 || 3.0.0-alpha300.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'mongo' );
    api.use( 'pwix:collection-timestampable@2.0.0' );
    api.use( 'pwix:forms@1.0.0-rc' );
    api.use( 'pwix:i18n@1.5.7' );
    api.use( 'pwix:modal@2.0.0' );
    api.use( 'pwix:notes@1.0.0-rc' );
    api.use( 'pwix:roles@1.3.0' );
    api.use( 'pwix:tabbed@1.0.0-rc' );
    api.use( 'pwix:tabular-ext@1.0.0-rc' );
    api.use( 'pwix:typed-message@1.2.0' );
    api.use( 'pwix:ui-bootstrap5@2.0.0-rc' );
    api.use( 'pwix:ui-utils@1.1.0' );
    api.use( 'random' );
    api.use( 'reactive-var' );
    api.addFiles( 'src/client/components/TenantPanel/TenantPanel.js', 'client' );
    api.addFiles( 'src/client/components/TenantsList/TenantsList.js', 'client' );
}
