# Class: PasswordValidator

Test password strength.

## See

https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls .

## Constructors

### Constructor

> **new PasswordValidator**(): `PasswordValidator`

#### Returns

`PasswordValidator`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### validate()

> `static` **validate**(`property`, `password`, `failures`, `options?`): `void`

Test the strength of the password.

#### Parameters

##### property

`string`

The name of the property.

##### password

`string`

The password to test.

##### failures

`IValidationFailure`[]

The list of failures to add to.

##### options?

Options to configure the testing.

###### minLength?

`number`

The minimum length of the password, defaults to 15, can be 8 if MFA is enabled.

###### maxLength?

`number`

The minimum length of the password, defaults to 128.

###### minPhraseLength?

`number`

The minimum length of the password for it to be considered a pass phrase.

#### Returns

`void`

***

### validatePassword()

> `static` **validatePassword**(`password`, `options?`): `void`

Validate the password against security policy.

#### Parameters

##### password

`string`

The password to validate.

##### options?

Options to configure the testing.

###### minLength?

`number`

The minimum length of the password, defaults to 8.

###### maxLength?

`number`

The minimum length of the password, defaults to 128.

###### minPhraseLength?

`number`

The minimum length of the password for it to be considered a pass phrase.

#### Returns

`void`

#### Throws

Error if the password does not meet the requirements.

***

### comparePasswordBytes()

> `static` **comparePasswordBytes**(`hashedPasswordBytes`, `storedPasswordBytes`): `boolean`

Compare two password byte arrays in constant time to prevent timing attacks.

#### Parameters

##### hashedPasswordBytes

`Uint8Array`

The computed password bytes to compare.

##### storedPasswordBytes

`Uint8Array`

The stored password bytes to compare against.

#### Returns

`boolean`

True if the bytes match, false otherwise.

***

### comparePasswordHashes()

> `static` **comparePasswordHashes**(`hashedPassword`, `storedPassword`): `boolean`

Compare two hashed passwords in constant time to prevent timing attacks.

#### Parameters

##### hashedPassword

`string`

The computed hash to compare.

##### storedPassword

`string`

The stored hash to compare against.

#### Returns

`boolean`

True if the hashes match, false otherwise.
