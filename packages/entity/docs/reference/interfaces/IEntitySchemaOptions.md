# Interface: IEntitySchemaOptions

Definition for an entity schema options.

## Extended by

- [`IEntitySchema`](IEntitySchema.md)

## Properties

### description? {#description}

> `optional` **description?**: `string`

Description of the object.

***

### version? {#version}

> `optional` **version?**: `number`

The schema version. Used to drive ordered migrations. Absent is treated as version 1.
