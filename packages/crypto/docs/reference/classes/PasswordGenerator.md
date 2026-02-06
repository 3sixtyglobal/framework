# Class: PasswordGenerator

Generate random passwords.

## Constructors

### Constructor

> **new PasswordGenerator**(): `PasswordGenerator`

#### Returns

`PasswordGenerator`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### generate()

> `static` **generate**(`length`): `string`

Generate a password of given length.

#### Parameters

##### length

`number` = `PasswordGenerator._DEFAULT_MIN_PASSWORD_LENGTH`

The length of the password to generate, default to 15.

#### Returns

`string`

The random password.

***

### hashPassword()

> `static` **hashPassword**(`passwordBytes`, `saltBytes`): `Promise`\<`string`\>

Hash the password for the user.

#### Parameters

##### passwordBytes

`Uint8Array`

The password bytes.

##### saltBytes

`Uint8Array`

The salt bytes.

#### Returns

`Promise`\<`string`\>

The hashed password.
