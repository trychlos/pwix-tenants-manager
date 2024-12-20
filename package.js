Package.describe({
    name: 'pwix:tenants-manager',
    version: '1.4.0',
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
    api.use( 'aldeed:simple-schema@1.13.1 || 2.0.0' );
    api.use( 'blaze-html-templates@2.0.0 || 3.0.0-alpha300.0', 'client' );
    api.use( 'ecmascript' );
    api.use( 'check' );
    api.use( 'less@4.0.0', 'client' );
    api.use( 'mongo' );
    api.use( 'pwix:collection-timestampable@2.0.0' );
    api.use( 'pwix:field@1.0.0-rc' );
    api.use( 'pwix:forms@1.0.0-rc' );
    api.use( 'pwix:i18n@1.5.7' );
    api.use( 'pwix:image-includer@1.0.0-rc' );
    api.use( 'pwix:modal@2.0.0' );
    api.use( 'pwix:notes@1.0.0-rc' );
    api.use( 'pwix:roles@1.7.0-rc' );
    api.use( 'pwix:tabbed@1.0.0-rc' );
    api.use( 'pwix:tabular@1.0.0-rc' );
    api.use( 'pwix:tolert@1.1.0' );
    api.use( 'pwix:typed-message@1.2.0' );
    api.use( 'pwix:ui-bootstrap5@2.0.0-rc' );
    api.use( 'pwix:ui-fontawesome6@1.0.0' );
    api.use( 'pwix:ui-utils@1.1.0' );
    api.use( 'pwix:validity@1.0.0-rc' );
    api.use( 'random' );
    api.use( 'reactive-var' );
    api.use( 'tmeasday:check-npm-versions@1.0.2 || 2.0.0-beta.0', 'server' );
    api.use( 'tracker' );
    api.addFiles( 'src/client/components/TenantEditPanel/TenantEditPanel.js', 'client' );
    api.addFiles( 'src/client/components/TenantRecordPropertiesPanel/TenantRecordPropertiesPanel.js', 'client' );
    api.addFiles( 'src/client/components/TenantNewButton/TenantNewButton.js', 'client' );
    api.addFiles( 'src/client/components/TenantsList/TenantsList.js', 'client' );
}
