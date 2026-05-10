# pwix:tenants-manager

## What is it ?

A try to mutualize and factorize the most common part of a multi-tenants management system:

- defines a basic schema and provides client and server check functions

- provides components to list and edit tenants

- provides client-side and server-side hooks to let the application easily extend the features.

Our tenants are defined in the common acceptance of the term as distinct organizations which are managed in a same software space. They can have validity periods. A tenant administrator can be defined as a scoped role.

## Installation

This Meteor package is installable with the usual command:

```sh
    meteor add pwix:tenants-manager
    meteor npm install email-validator lodash valid-url --save
```

## Storage considerations

When an application makes use of this package to manage several tenants, two `tenants_e` and `tenants_r` collections are created which gathers defined tenants. That's all, and, in particular, this doesn't create for the application any assumption about the way the application tenants data will be themselves stored (in distinct databases, in distinct collections, or so).

- the `tenants_e` collection contains datas which are common to all validity periods, which default to only be an identifier

- the `tenants_r` collection contains datas which are tied to a particular validity period.

## Edition considerations

This tenant manager defaults to edit a tenant in an edition modal, with all its validity periods at once.

This can become rapidly a moment of big data consumption as the data of each period is multiplied by the count of validity periods.

When the count of validity periods becomes too large, it could be useful and more easy to only edit validity periods one at a time. The edition button of the tabular display is modified so that it proposes a dropdown menu which includes each existing validity period in addition of a 'all' item.

Note that there is no such thing as deleting a period. Periods can be merged together, or a new period can be defined inside of a free space, and merged back later. Editing the validity start and end of a period can be done when inside a single period edition modal. But merging periods requires to have the full validity periods edition modal.

## Provides

### `TenantsManager`

The exported `TenantsManager` global object provides following items:

#### Functions

##### `TenantsManager.configure( o<Object> )`

See [below](#configuration).

The package configuration only determines the global behavior of the package.

For more precise details and options, the caller could take advantage of the various `setupXxxxxx()` functions (see below).

##### `TenantsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

##### `TenantsManager.setupEditor( options<Object> )`

Define the runtime options for editing the tenants, where options is an optional arguments object with following keys:

- `entitiesTabsFn`

    A `async fn( tabs<Array>, dataContect<Object> ): <Array` function which will receive the default list of editing entity tabs, and must return the new list of editing entity tabs.

    Default is none.

    Provided data context is an object with:

    - `entity`: a ReactiveVar which contains the entity to be edited

    - `checker`: a ReactiveVar which contains the parent Checker, or undefined if there is none.

- `recordsTabsFn`

    A `async fn( tabs<Array>, dataContect<Object> ): <Array` function which will receive the default list of editing record tabs, and must return the new list of editing record tabs.

    Default is none.

    Provided data context is an object with:

    - `entity`: a ReactiveVar which contains the entity to be edited

    - `index`: the index of the currently edited record

    - `checker`: a ReactiveVar which contains the parent Checker, or undefined if there is none.

- `withCloseButtonWhileNotModified`

    Whether the modal dialog should propose only a `Close` button while the Tenant is not modified, defaulting to `false`.

    Default is to always propose both `Cancel` and `OK` buttons.

Available both on the client and the server, but only used in the client (server-side is just a no-op).

##### `TenantsManager.setupHooks()`

Define optional server-side hooks:

    - `async preCreateFn( userDoc<Object>, userId<String> ): <void>`
    - `async postCreateFn( userDoc<Object>, userId<String> ): <void>`

    - `async preDeleteFn( userDoc<Object>, userId<String> ): <void>`
    - `async postDeleteFn( userDoc<Object>, userId<String> ): <void>`

    - `async preUpdateFn( userDoc<Object>, userId<String>, opts<Object> ): <void>`
    - `async postUpdateFn( userDoc<Object>, userId<String>, opts<Object> ): <void>`

        These functions can modify in place the `userDoc` document.

The `pre`-functions should throw an error if they want cancel the operation.

Available on the server only.

##### `TenantsManager.setupTabular( options<Object>, buttonsHookFn<Function> )`

Instanciates the Tabular.Table, and define the runtime options for displaying the list of the available tenants, where:

- `options` is an optional arguments object; they will be provided as-is both to `pwix:tabular` and to `aldeed:tabular` packages.

- `buttonsHookFn` is an optional `async fn( table<Tabular.Table>, buttons<Array> ): <Array>` function which receives the list of template names to be installed as buttons, can modify it, and must return the new list of template names.

Must be called in the same terms both on the client and the server.

#### Events emitter

On server side, `TenantsManager` is an event emitter through the `TenantsManager.s.eventEmitter` object.

Following events are sent:

- `added`, from the `tenantsAll` publication, with arguments as `id<String>, tenantDoc<Object>`

- `changed`, from the `tenantsAll` publication, with arguments as `id<String>, tenantDoc<Object>`

- `removed`, from the `tenantsAll` publication, with arguments as `id<String>`

- `tenant-upsert`, from the server function when an entity has been added or changed, with an object as argument with following keys:

    - `entity`: the entity with its DYN sub-object
    - `result`: the results of the operation in Entities and Records collections.

- `tenant-delete`, from the server function when an entity (and all its records) has been deleted, with an object as argument with following keys:

    - `id`: the entity identifier
    - `result`: the results of the operation in Entities and Records collections.

### `TenantsManager.Entities`
### `TenantsManager.Records`

These are the two main managed collections. Both provides:

- `collection`: the actual Mongo collection

- `collectionName`: the actual configured name of the collection

- `fieldSet`: a ReactiveVar which contains the current `Field.Set` of the entities (resp. the records).

    The fieldsets are automatically reset to their defaults each time the package is configured. If the caller wishes extend the fieldsets, then he/she must do that after each package (re)configuration.

    Each update of these fieldsets automatically redefines all dependants, and notably the tabular displays, the Mongo schemas, and so on.

- `ready`: a reactive data source, true when the collection is ready

Default Entities fields are:

- `notes`: entity notes.

Default Records fields are:

- `label`: mandatory unique label
- `homeUrl`: home page url
- `contactEmail`: contact email address
- `logoUrl`: logo url
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`: timestampable behaviour
- `notes`: user notes.

### `TenantsManager.Tenants`

A pseudo-collection which provides the publications, the read and update accesses and the transformations.

- `transformsPublish( publication<String> ): <Array>`

Returns the current transformation functions array for the named publication, and let the caller examines it, reset it or update it.

Prototype of the transformation functions is `async fn( tenantDoc<Object>, options<Object>, userId<String> ): tenantDoc<Object>`, where:

- `options` is the options passed to the publication function with added keys:

    - `type`: 'publish'
    - `source`: the publication name,
    - `index`: the index of the transformation function, counted from zero

- `userId` is the identifier of the user who has subscribed to the publication.

Default transformation on publications is to add the `preferredLabel()` result inside of a `DYN` sub-object.

Available on the server only.

- `transformsRead(): <Array>`

Returns the current transformation functions array for read accesses, and let the caller examines it, reset it or update it.

Prototype of the transformation functions is `async fn( tenantDoc<Object>, options<Object> ): tenantDoc<Object>`, where:

- `options` is the options passed to the read function - usually Mongo qualifiers - with added keys:

    - `type`: 'read'
    - `source`: the read function name,
    - `index`: the index of the transformation function, counted from zero.

Default transformation on read accesses is to add the `preferredLabel()` result inside of a `DYN` sub-object.

Available both on the client and the server.

- `transformsUpdate()`

Returns the current transformation functions array for update accesses, and let the caller examines it, reset it or update it.

Prototype of the transformation functions is `async fn( tenantDoc<Object>, options<Object> ): tenantDoc<Object>`, where:

- `options` is the options passed to the update function - maybe `orig` and Meteor qualifiers - with added keys:

    - `type`: 'update'
    - `source`: the update function name,
    - `index`: the index of the transformation function, counted from zero.

Note that writers of transformation functions for update accesses should wonder if they want modify the document itself, or clone the document before mmodifying it.

Default transformation on update accesses is to remove the `DYN` sub-object. The function returns a modified clone of the initial document.

Available on the server only.

### Blaze components

#### `TenantEditPanel`

A tabbed editing panel to be run inside of a page or of a modal. This is a two-levels `Tabbed` component with:

- the first level manages the entity, and contains a sub-`Tabbed` component for the records and an `entity_notes_tab` pane for the entity notes

- each validity period is in second-level tab, with record properties and notes panes.

When run from [`TenantsList`](#tenantslist), it is run in a modal to edit the current item.

The `TenantEditPanel` component accepts a data context as:

- `item`: the item to be edited, or null (or unset)

- `checker`: a ReactiveVar which holds the parent Checker, may be null if none

- `entitiesTabsFn`: an optional async function which overrides the `setupEditor()` eponym, defaulting to the `entitiesTabsFn` editor option (see [`setupEditor()`](#tenantsmanager-setupeditor))

- `recordsTabsFn`: an optional async function which overrides the `setupEditor()` eponym, defaulting to the `recordsTabsFn` editor option (see [`setupEditor()`](#tenantsmanager-setupeditor)).

#### `TenantNewButton`

A `PlusButton` component customized to create a new tenant.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either is disabled, or doesn't display at all if the user is not allowed.

It takes the very same data context than above `TenantEditPanel`.

#### `TenantsList`

The component list the defined tenants as a `pwix:tabular_ext` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

Each rendered line of the table displays an entity, and the closest values for each column.

It takes the very same data context than above `TenantEditPanel`.

#### `TenantsRecordPropertiesPanel`

A panel which let the user edit the record properties of the tenant.

It accepts a data context as:

- `entity`: the currently edited entity as a ReactiveVar

- `index`: the index of the edited record

- `checker`: the Forms.Checker which manages the parent component

- `enableChecks`: whether the checks should be enabled at startup, defaulting to true.

## Permissions management

This package can take advantage of `pwix:permissions` package to manage the user permissions.

It defines following tasks:

- `pwix.tenants_manager.feat.list`: whether the user is allowed to access the tabular list component.

    A client-side only permission.

- `pwix.tenants_manager.fn.create`: whether the user is allowed to create a new tenant.

- `pwix.tenants_manager.fn.delete`, with args `item<Object>`: whether the user is allowed to delete the tenant.

- `pwix.tenants_manager.fn.edit`, with args `item<Object>`: whether the user is allowed to edit the tenant

- `pwix.tenants_manager.fn.read`, with args `itemId<String>`: whether the user is allowed to access the given tenant.

- `pwix.tenants_manager.pub.list`: whether the user is allowed to see the list of the tenants he/she is allowed to.

    This should be `true` for all connected users.

    A server-side only permission.

## Configuration

The package's behavior can be configured through a call to the `TenantsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `allowFn`

    An async function which will be called with an action string identifier, and must return whether the current user is allowed to do the specified action.

    If the function is not provided, then the default is to deny all actions.

    `allowFn` prototype is: `async allowFn( action<String> [, ...<Any> ] ): Boolean`

- `editFn`

    The function to be used to edit an existing Tenant.

    The provided function must have prototype as ``, and takes itself care of serializing the done modifications.

    Default is to run `TenantEditPanel` inside a modal dialog.

- `newFn`

    The function to be used to create a new Tenant.

    The provided function must have prototype as ``, and takes itself care of serializing the creation.

    Default is to run `TenantEditPanel` inside a modal dialog.

- `scopedManagerRole`

    The name of the role which holds the scoped management for a tenant, defaulting to `SCOPED_TENANT_MANAGER`.

- `tenantsCollection`

    The radical of the names of the tenants Mongo collections.

    Defaults to `tenants`.

    The actual collection names will be this radical plus `_e` for entities and `_r` for records, e.g. `tenants_e` and `tenants_r`.

- `verbosity`

    The verbosity level as:

    - `TenantsManager.C.Verbose.NONE`

    or an OR-ed value of integer constants:

    - `TenantsManager.C.Verbose.CONFIGURE`

        Trace configuration operations

    - `TenantsManager.C.Verbose.FUNCTIONS`

        Trace all function calls

    - `TenantsManager.C.Verbose.ATTACHSCHEMA`

        Trace the schemas attachement operations

    - `TenantsManager.C.Verbose.READY`

        Trace the readyness status changes

    Defaults to `TenantsManager.C.Verbose.CONFIGURE`.

- `withDedicatedEmails`

    Whether you are enough and happy with the predefined dedicated email:

    - `contactEmail`

    Each tenants **requires** at least one contact email address. If you prefer our generalized email system and do not use the predefined dedicated email, then the used contact email address will be the first address whose label insensitively matches the 'contact' string, defaulting to the first email address. `withDedicatedEmails` and `withGeneralizedEmails` cannot both be `false`.

    Defaults to `true`.

- `withDedicatedUrls`

    Whether you are enough and happy with the predefined dedicated URL:

    - `homeUrl`

    No URL is required, but a warning will be emitted if both `withDedicatedUrls` and `withGeneralizedUrls` are `false`.

    Defaults to `true`.

- `withGeneralizedEmails`

    Whether you are willing to use our generalized email system.

    The generalized email system we propose is just an array of label+email address. You can so set any number of email addresses of your choice.

    Defaults to `false`.

- `withGeneralizedUrls`

    Whether you are willing to use our generalized URL system.

    The generalized URL system we propose is just an array of label+URL. You can so set any number of URLs of your choice.

    Defaults to `false`.

- `withValidities`

    Whether we want manage validity periods for the tenants, defaulting to `true`.

- `modifiedOnUpdate`:

    Whether the user interface begins with only a 'Close' button, only proposing 'Cancel' and 'OK' buttons when the tenant has been detected as modified.

    If the application has extended the Tenant properties, then it has too to detect itself whether its own properties have been modified.

    Defauls to `false`.

- `xx showEmptyGeneralizedEmails`

    Whether we should show a '...' disabled button in the tabular display when there is no email to be displayed.

    Defaults to `false`.

- `xxx showEmptyGeneralizedUrls`

    Whether we should show a '...' disabled button in the tabular display when there is no URL to be displayed.

    Defaults to `false`.

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `TenantsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `TenantsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.7.0:

```js
    'email-validator': '^2.0.4',
    'lodash': '^4.17.0',
    'valid-url': '^1.0.9'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-tenants-manager/pulls).

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-tenants-manager/issues).

---
P. Wieser
- Last updated on 2026, May. 10th
