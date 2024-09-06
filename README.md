# pwix:tenants-manager

## What is it ?

A try to mutualize and factorize the most common part of a multi-tenants management system:

- defines a basic schema and provides client and server check functions

- provides components to list and edit tenants.

Our tenants are defined in the common acceptance of the term as distinct organizations which are managed in a same software space. They can have validity periods. A tenant administrator can be defined as a scoped role.

### Storage considerations

When an application makes use of this package to manage several tenants, two `tenants_e` and `tenants_r` collections are created which gathers defined tenants. That's all, and, in particular, this doesn't create for the application any assumption about the way the application tenants data will be themselves stored (in distinct databases, in distinct collections, or so).

- the `tenants_e` collection contains datas which are common to all validity periods, which default to only be a label

- the `tenants_r` collection contains datas which are tied to a particular validity period.

## Provides

### `TenantsManager`

The exported `TenantsManager` global object provides following items:

#### Functions

##### `TenantsManager.configure( o<Object> )`

See [below](#configuration)

##### `TenantsManager.getScopes()`

An async function which returns an array of known tenants identifier, and their closest label.

This function is not reactive.

If reactivity is desired, the caller should prefer the `pwix_tenants_manager_tenants_get_scopes` publication.

##### `TenantsManager.i18n.namespace()`

Returns the i18n namespace used by the package. Used to add translations at runtime.

Available both on the client and the server.

#### Blaze components

##### `TenantEditPanel`

A tabbed editing panel to be run inside of a page or of a modal. This is a two-levels `Tabbed` component with:

- the first level manages the entity, and contains a sub-`Tabbed` component for the records and an `entity_notes_tab` pane for the entity notes

- each validity period is in second-level tab, with record properties and notes panes.

When run from [`TenantsList`](#tenantslist), it is run in a modal to edit the current item.

The `TenantEditPanel` component accepts a data context as:

- `item`: the item to be edited, or null (or unset)

- `entityTabs`: a list of tabs to be inserted before the 'notes' tabs of the entity

- `recordTabs`: a list of tabs to be inserted before the 'notes' tabs of the record

##### `TenantNewButton`

A `PlusButton` component customized to create a new tenant.

It takes itself care of checking the permissions of the user, and, depending of its runtime parameters, either is disabled, or doesn't display at all if the user is not allowed.

It takes the very same data context than below `TenantEditPanel`.

##### `TenantsList`

The component list the defined tenants as a `pwix:tabular_ext` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

Each rendered line of the table displays an entity, and the closest values for each column.

It takes the very same data context than below `TenantEditPanel`.

## Permissions management

This package can take advantage of `pwix:permissions` package to manage the user permissions.

It defines following tasks:

- at the user interface level
    - `pwix.tenants_manager.feat.delete`, with args `item<Object>`: delete a tenant
    - `pwix.tenants_manager.feat.edit`, with args `item<Object>`: edit a tenant
    - `pwix.tenants_manager.feat.new`: create a new tenant

- at the server level
    - `pwix.tenants_manager.entities.fn.get_by`, with args `selector<Object>`: get entities from a Mongo selector
    - `pwix.tenants_manager.entities.fn.upsert`, with args `item<Object>`: upsert an entity
    - `pwix.tenants_manager.records.fn.get_by`, with args `selector<Object>`: get records from a Mongo selector
    - `pwix.tenants_manager.records.fn.upsert`, with args `item<Object>`: upsert a record
    - `pwix.tenants_manager.fn.delete_tenant`, with args `entity<String>`: delete a tenant
    - `pwix.tenants_manager.fn.get_scopes`: provides a list of known scopes
    - `pwix.tenants_manager.fn.set_managers`, with args `item<Object>`: set managers
    - `pwix.tenants_manager.fn.upsert`, with args `item<Object>`: upsert a tenant

- on publications
    - `pwix.tenants_manager.pub.list_all`: list all tenants and their contents
    - `pwix.tenants_manager.pub.closests`: list the closest record of each tenant, a tabular display requisite
    - `pwix.tenants_manager.pub.tabular`: a tabular-aware publication
    - `pwix.tenants_manager.pub.known_scopes`: publishes a list of the known scopes to be used as a reference when editing scoped roles

## Configuration

The package's behavior can be configured through a call to the `TenantsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `allowFn`

    An async function which will be called with an action string identifier, and must return whether the current user is allowed to do the specified action.

    If the function is not provided, then the default is to deny all actions.

    `allowFn` prototype is: `async allowFn( action<String> [, ...<Any> ] ): Boolean`

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `entityFields`

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

- `hideDisabled`

    Whether to hide disabled actions instead of displaying the disabled state.

    Defaults to `true`: disabled actions are hidden.

- `recordFields`

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

- `roles`

    Let the application provides the permissions required to perform CRUD operations on the Tenants collection. This is an object with following keys:

    - `list`: defaulting to `null` (allowed to all)
    - `create`: defaulting to `null` (allowed to all)
    - `edit`: defaulting to `null` (allowed to all)
    - `delete`: defaulting to `null` (allowed to all)

- `tenantButtons`

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

- `tenantFields`

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

- `tenantsCollection`

    The radical of the names of the tenants Mongo collections.

    Defaults to `tenants`.

- `verbosity`

    The verbosity level as:

    - `TenantsManager.C.Verbose.NONE`

    or an OR-ed value of integer constants:

    - `TenantsManager.C.Verbose.CONFIGURE`

        Trace configuration operations

    Defaults to `TenantsManager.C.Verbose.CONFIGURE`.

- `withValidities`

    Whether we want manage validity periods for the tenants, defaulting to `true`.

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `TenantsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `TenantsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.0.0:

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
- Last updated on 2024, Jul. 18th
