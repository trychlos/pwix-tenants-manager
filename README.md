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

##### `TenantsManager.getScopes()`

An async function which returns an array of known tenants identifier, and their closest label.

This function is not reactive.

If reactivity is desired, the caller should prefer to subscribe to the `pwix.TenantsManager.p.Tenants.getScopes` publication.

##### `TenantsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

##### `TenantsManager.setupEditor()`

Define the runtime options for editing the tenants.

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

##### `TenantsManager.setupTabular()`

Define the runtime options for displaying the list of the available tenants.

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

- `collectionReady`: a ReactiveVar, true when the collection is ready

- `fieldSet`: a ReactiveVar which contains the current `Field.Set` of the entities (resp. the records).

    Each update of these fieldsets automatically redefines all dependants, and notably the tabular displays, the Mongo schemas, and so on.

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

- `entityTabsBefore`: a list of tabs to be inserted at the very start of the tabs of the entity

- `entityTabs`: a list of tabs to be inserted before the 'notes' tabs of the entity

- `entityTabsAfter`: a list of tabs to be inserted after the 'notes' tabs of the entity, i.e. at the end

- `recordTabsBefore`: a list of tabs to be inserted at the very start tabs of the record

- `recordTabs`: a list of tabs to be inserted before the 'notes' tabs of the record

- `recordTabsAfter`: a list of tabs to be inserted after the 'notes' tabs of the record, i.e. at the end

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

- `enableChecks`: whether the checks should be enabled at startup, defaulting to true

- `withGeneralizedEmails`: whether we want edit the generalized email addresses, defaulting to the configured `propertiesHaveGeneralizedEmails` value

- `withGeneralizedUrls`: whether we want edit the generalized URLs, defaulting to the configured `propertiesHaveGeneralizedUrls` value.

## Permissions management

This package can take advantage of `pwix:permissions` package to manage the user permissions.

It defines following tasks:

- `pwix.tenants_manager.feat.create`: whether the user is allowed to create a new tenant,

- `pwix.tenants_manager.feat.delete`, with args `item<Object>`: whether the user is allowed to delete the tenant

- `pwix.tenants_manager.feat.edit`, with args `item<Object>`: whether the user is allowed to edit the tenant

- `pwix.tenants_manager.feat.list`: whether the user is allowed to see a list of tenants (he is allowed to).

- `pwix.tenants_manager.feat.read`, with args `itemId<String>`: whether the user is allowed to see the identfied tenant.

## Configuration

The package's behavior can be configured through a call to the `TenantsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `allowFn`

    An async function which will be called with an action string identifier, and must return whether the current user is allowed to do the specified action.

    If the function is not provided, then the default is to deny all actions.

    `allowFn` prototype is: `async allowFn( action<String> [, ...<Any> ] ): Boolean`

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

    Defaults to `TenantsManager.C.Verbose.CONFIGURE`.

- `withDedicatedEmails`

    Whether you are enough with the predefined dedicated email:

    - `contactEmail`

    Each tenants **requires** at least one contact email address. If you prefer our generalized email system and do not use the predefined dedicated email, then the used contact email address will be the first address whose label insensitively matches the 'contact' string, defaulting to the first email address. `withDedicatedEmails` and `withGeneralizedEmails` cannot both be `false`.

    Defaults to `true`.

- `withDedicatedUrls`

    Whether you are enough with the predefined dedicated URL:

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

- `xx classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `xx entityFields`

    Let the application extends the Entities default schema by providing additional fields as an array of `Field.Set.extend()`-valid definitions, or as a function which returns such an array of `Field.Set.extend()`-valid definitions.

    Defauts to nothing.

    Example:

```js
    TenantsManager.configure({
        entityFields: [
            {
                before: 'notes',
                fields: [
                    {
                        name: 'label',
                        type: String,
                        optional: true
                    }
                ]
            }
        ]
    });
```

    Default Entities fields are:

    - `notes`: common notes
    - `createdAt`, `createdBy`, `updatedAt`, `updatedBy`: timestampable behaviour.

- `xx listHasContactEmail`

    Whether to display the Contact email address in the tabular display.

    Defaults to `true`.

- `xx listHasContactUrl`

    Whether to display the Contact page URL in the tabular display.

    Defaults to `true`.

- `xx listHasGeneralizedEmails`

    Whether to display the first email address of the generalized list, with an 'see more' button, in the tabular display.

    Defaults to `false`.

- `xx listHasHomeUrl`

    Whether to display the Home page URL in the tabular display.

    Defaults to `true`.

- `xx listHasGeneralizedUrls`

    Whether to display the first URL of the generalized list, with an 'see more' button, in the tabular display.

    Defaults to `false`.

- `xx maxGeneralizedEmails`: when using the generalized emails structure, the maximum count of required emails, defaulting to -1 which means unlimited.

    Take care that setting this max to zero will actually prevent any email address to be entered.

- `xx minGeneralizedEmails`: when using the generalized emails structure, the minimum count of required emails, defaulting to 1.

- `modifiedOnUpdate`:

    Whether the user interface begins with only a 'Close' button, only proposing 'Cancel' and 'OK' buttons when the tenant has been detected as modified.

    If the application has extended the Tenant properties, then it has too to detect itself whether its own properties have been modified.

    Defauls to `false`.

- `xx propertiesHaveGeneralizedUrls`: whether we want the properties editition has the generalized URLs, defaulting to `false`.

- `xx propertiesHaveGeneralizedEmails`: whether we want properties editition has the generalized email addresses, defaulting `false`.

- `xx recordFields`

    Let the application extends the Records default schema by providing additional fields as an array of `Field.Set.extend()`-valid definitions, or as a function which returns such an array of `Field.Set.extend()`-valid definitions.

    Defauts to nothing.

    Example:

```js
    TenantsManager.configure({
        recordFields: [
            {
                before: 'label',
                fields: [
                    {
                        name: 'secondaryLabel',
                        type: String,
                        optional: true
                    }
                ]
            }
        ]
    });
```

    Default Records fields are:

    - `label`: mandatory unique label
    - `pdmpUrl`: personal data management policy page url
    - `gtuUrl`: general terms of use page url
    - `legalsUrl`: legal terms page url
    - `homeUrl`: home page url
    - `supportUrl`: support page url
    - `contactUrl`: contact page url
    - `supportEmail`: support email address
    - `contactEmail`: contact email address
    - `logoUrl`: logo url
    - `logoImage`: logo image
    - `createdAt`, `createdBy`, `updatedAt`, `updatedBy`: timestampable behaviour.

- `xx roles`

    Let the application provides the permissions required to perform CRUD operations on the Tenants collection. This is an object with following keys:

    - `list`: defaulting to `null` (allowed to all)
    - `create`: defaulting to `null` (allowed to all)
    - `edit`: defaulting to `null` (allowed to all)
    - `delete`: defaulting to `null` (allowed to all)

- `xx showEmptyGeneralizedEmails`

    Whether we should show a '...' disabled button in the tabular display when there is no email to be displayed.

    Defaults to `false`.

- `xxx showEmptyGeneralizedUrls`

    Whether we should show a '...' disabled button in the tabular display when there is no URL to be displayed.

    Defaults to `false`.

- `xx serverAllExtend`

    A server-side function which comes to extend the content of the 'tenantsAll' publication.

    The function get the current entity item as its unique argument and returns a Promise when finished with its job.

    TO BE REPLACED WITH A READ TRANSFORMATION

    Defaults to `null`.

- `xx serverTabularExtend`

    A server-side function which comes to extend the content of the dataset published for the tabular display.

    The function get the current entity item as its unique argument and returns a Promise when finished with its job.

    TO BE REPLACED WITH AN AD-HOC PUBLISH TRANSFORMATION

    Defaults to `null`.

- `xx tenantButtons`

    Let the application extends the Tenants default tabular display by providing additional buttons as an array of template names, or as a function which returns such an array.

    The template will be called with the current row item as its data context.

    Defauts to nothing.

    Example:

```js
    TenantsManager.configure({
        tenantButtons: [
            {
                where: Tabular.C.Where.AFTER,
                buttons: [
                    'my_template'
                ]
            }
        ]
    });
```

- `xx tenantFields`

    Let the application extends the Tenants default tabular display by providing additional fields as an array of `Field.Set.extend()`-valid definitions, or as a function which returns such an array of `Field.Set.extend()`-valid definitions.

    Defauts to nothing.

    Example:

```js
    TenantsManager.configure({
        tenantFields: [
            {
                before: 'label',
                fields: [
                    {
                        name: 'column',
                        schema: false,
                        dt_title: 'My title',
                        dt_className: 'dt-center'
                    }
                ]
            }
        ]
    });
```

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `TenantsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `TenantsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.5.0:

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
- Last updated on 2026, Feb. 10th
