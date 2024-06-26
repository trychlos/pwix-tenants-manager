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

#### Blaze components

##### `TenantsList`

The component list the defined tenants as a `pwix:tabular_ext` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

## Configuration

The package's behavior can be configured through a call to the `TenantsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `fields`

    Let the application extends the default schema by providing additional fields as a `Field.Set` extension, or as a function which returns such a `Field.Set` extension.

    Defauts to nothing.

    Example:

```js
    TenantsManager.configure({
        fieldsSet: new Forms.FieldsSet(
            {
                name: 'apiAllowed',
                type: Boolean,
                defaultValue: false
            }
        ),
        //haveEmailAddress: AC_FIELD_MANDATORY,
        //haveUsername: AC_FIELD_NONE
        roles: {
            list: 'TENANTS_LIST',
            create: 'TENANT_CREATE',
            edit: 'TENANT_EDIT',
            delete: 'TENANT_DELETE'
        }
        // verbosity: TenantsManager.C.Verbose.CONFIGURE
    });
```

- `hideDisabled`

    Whether to hide disabled actions instead of displaying the disabled state.

    Defaults to `true`: disabled actions are hidden.

- `roles`

    Let the application provides the permissions required to perform CRUD operations on the Tenants collection. This is an object with following keys:

    - `list`: defaulting to `null` (allowed to all)
    - `create`: defaulting to `null` (allowed to all)
    - `edit`: defaulting to `null` (allowed to all)
    - `delete`: defaulting to `null` (allowed to all)

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

A function can be provided by the application for each of these parameters. The function will be called without argument and must return a suitable value.

Please note that `TenantsManager.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `TenantsManager.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 0.1.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 0.3.0:

```js
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

None at the moment.

## Cookies and comparable technologies

None at the moment.

## Issues & help

In case of support or error, please report your issue request to our [Issues tracker](https://github.com/trychlos/pwix-tenants-manager/issues).

---
P. Wieser
- Last updated on 2024, May. 24th
