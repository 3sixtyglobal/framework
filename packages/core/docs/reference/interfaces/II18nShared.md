# Interface: II18nShared

The shared state for the I18n global.

## Properties

### localeDictionaries {#localedictionaries}

> **localeDictionaries**: `object`

Dictionaries for lookups.

#### Index Signature

\[`locale`: `string`\]: `object`

***

### currentLocale {#currentlocale}

> **currentLocale**: `string`

The current locale.

***

### localeChangedHandlers {#localechangedhandlers}

> **localeChangedHandlers**: `object`

Change handler for the locale being updated.

#### Index Signature

\[`id`: `string`\]: (`locale`) => `void`

***

### dictionaryChangedHandlers {#dictionarychangedhandlers}

> **dictionaryChangedHandlers**: `object`

Change handler for the dictionaries being updated.

#### Index Signature

\[`id`: `string`\]: (`locale`) => `void`
