# pwix:tenants-manager

## What is it ?

A try to mutualize and factorize the most common part of a simple accounts management system:

- defines the account schema and provides client and server check functions

- provides components to list and edit accounts.

## Schema

`pwix:tenants-manager` is based on Meteor `accounts-base`, and extends its standard schema as:

```js
    {
        _id: {
            type: String
        },
        emails: {
            type: Array,
            optional: true
        },
        'emails.$': {
            type: Object
        },
        'emails.$.address': {
            type: String,
            regEx: SimpleSchema.RegEx.Email,
        },
        'emails.$.verified': {
            type: Boolean
        },
        username: {
            type: String,
            optional: true
        },
        profile: {
            type: Object,
            optional: true,
            blackbox: true
        },
        services: {
            type: Object,
            optional: true,
            blackbox: true
        },
        lastConnection: {
            type: Date
        },
        loginAllowed: {
            type: Boolean,
            defaultValue: true
        },
        userNotes: {
            type: String
        },
        adminNotes: {
            type: String
        }
    }
```

As it also makes the collection timestampable, following fields are also added and maintained:

```js
    createdAt
    updatedAt
    CreatedBy
    updatedBy
```

## Provides

### `TenantsManager`

The exported `TenantsManager` global object provides following items:

#### Functions

#### Blaze components

##### `TenantsList`

The component list the defined accounts as a `pwix:tabular_ext` table, with standard 'Informations', 'Edit' and 'Delete' buttons.

## Configuration

The package's behavior can be configured through a call to the `TenantsManager.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `classes`

    Let the application provides some classes to add to the display.

    Defauts to nothing.

- `fieldsSet`

    Let the application extends the default schema by providing additional fields as a `Forms.FieldSet` definition.

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
            list: 'ACCOUNTS_LIST',
            create: 'ACCOUNT_CREATE',
            edit: 'ACCOUNT_EDIT',
            delete: 'ACCOUNT_DELETE'
        }
        // verbosity: TenantsManager.C.Verbose.CONFIGURE
    });
```

- `haveEmailAddress`
- `haveUsername`

    Whether the user accounts are to be configured with or without a username (resp. an email address), and whether it is optional or mandatory.

    For each of these terms, accepted values are:

    - `TenantsManager.C.Input.NONE`: the field is not displayed nor considered
    - `TenantsManager.C.Input.OPTIONAL`: the input field is proposed to the user, but may be left empty
    - `TenantsManager.C.Input.MANDATORY`: the input field must be filled by the user

    At least one of these fields MUST be set as `TenantsManager.C.Input.MANDATORY`. Else, the default value will be applied.

    Defauts to:

    - `haveEmailAddress`: `TenantsManager.C.Input.MANDATORY`
    - `haveUsername`: `TenantsManager.C.Input.NONE`

    Please be conscious that some features of your application may want display an identifier for each user. It would be a security hole to let the application display a verified email address anywhere, as this would be some sort of spam magnet!

- `roles`

    Let the application provides the permissions required to perform CRUD operations on the Users collection. This is an object with following keys:

    - `list`: defaulting to `null` (allowed to all)
    - `create`: defaulting to `null` (allowed to all)
    - `edit`: defaulting to `null` (allowed to all)
    - `delete`: defaulting to `null` (allowed to all)

- `scopesFn`

    An application-provided function which is expected to return all existing (roles) scopes.

    Defaults to only manage scopes that are already used in the `Roles` package.

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
    '@popperjs/core': '^2.11.6',
    'bootstrap': '^5.2.1',
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
