// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, Is, ObjectHelper } from "@3sixty/core";
import { ComparisonOperator } from "../models/comparisonOperator.js";
import type { EntityCondition } from "../models/entityCondition.js";
import type { IComparator } from "../models/IComparator.js";
import { LogicalOperator } from "../models/logicalOperator.js";

/**
 * Class to perform condition checks.
 */
export class EntityConditions {
	/**
	 * See if the entity matches the conditions.
	 * @param entity The entity to test.
	 * @param condition The conditions to test.
	 * @returns True if the entity matches.
	 */
	public static check<T>(entity: T, condition?: EntityCondition<T>): boolean {
		// If no conditions are defined then it's a match
		if (Is.undefined(condition)) {
			return true;
		}

		if ("conditions" in condition) {
			// It's a group of comparisons, so check the individual items and combine with the logical operator
			const results: boolean[] = condition.conditions.map(c => EntityConditions.check(entity, c));
			if ((condition.logicalOperator ?? LogicalOperator.And) === LogicalOperator.And) {
				return results.every(Boolean);
			}
			return results.some(Boolean);
		}

		if (condition.property.includes(".")) {
			// It's a child property comparison, so evaluate the child property
			// and then compare it to the conditions
			const path = condition.property.split(".");

			const child = ObjectHelper.propertyGet(entity, path[0]);

			// If the child is an array then check each item
			if (Is.array(child)) {
				for (const c of child) {
					const check = EntityConditions.check(c, {
						...condition,
						property: path.slice(1).join(".")
					});
					if (check) {
						return true;
					}
				}
				return false;
			}
		}

		// It's a single value so just check the condition
		return EntityConditions.compare(entity, condition);
	}

	/**
	 * See if the entity matches the conditions.
	 * @param entity The entity to test.
	 * @param comparator The condition to test.
	 * @returns True if the entity matches.
	 */
	public static compare<T>(entity: T, comparator: IComparator): boolean {
		const value = ObjectHelper.propertyGet(entity, comparator.property);
		const conditionValue = comparator.value;
		const comparison = comparator.comparison;

		if (Is.undefined(conditionValue)) {
			return EntityConditions.matchEquality(Is.undefined(value), comparison);
		}

		if (conditionValue === null) {
			return EntityConditions.matchEquality(value === null, comparison);
		}

		if (Is.string(value)) {
			return Is.string(conditionValue)
				? EntityConditions.compareString(value, conditionValue, comparison)
				: EntityConditions.compareIn(value, conditionValue, comparison);
		}

		if (Is.number(value)) {
			return Is.number(conditionValue)
				? EntityConditions.compareOrdered(value, conditionValue, comparison)
				: EntityConditions.compareIn(value, conditionValue, comparison);
		}

		if (Is.boolean(value)) {
			return Is.boolean(conditionValue)
				? EntityConditions.matchEquality(value === conditionValue, comparison)
				: EntityConditions.compareIn(value, conditionValue, comparison);
		}

		if (Is.array(value)) {
			return EntityConditions.compareArray(value, conditionValue, comparison);
		}

		if (Is.object(value)) {
			return EntityConditions.matchEquality(ObjectHelper.equal(value, conditionValue), comparison);
		}

		return false;
	}

	/**
	 * Resolve an equality result for the equals and not equals operators.
	 * @param isEqual Whether the two values are equal.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static matchEquality(isEqual: boolean, comparison: ComparisonOperator): boolean {
		return (
			(comparison === ComparisonOperator.Equals && isEqual) ||
			(comparison === ComparisonOperator.NotEquals && !isEqual)
		);
	}

	/**
	 * Resolve an inclusion result for the includes and not includes operators.
	 * @param isIncluded Whether the value is included.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static matchInclusion(isIncluded: boolean, comparison: ComparisonOperator): boolean {
		return (
			(comparison === ComparisonOperator.Includes && isIncluded) ||
			(comparison === ComparisonOperator.NotIncludes && !isIncluded)
		);
	}

	/**
	 * Compare a value with the in operator against a list of condition values.
	 * @param value The value to test.
	 * @param conditionValue The condition value which should be a list.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static compareIn(
		value: unknown,
		conditionValue: unknown,
		comparison: ComparisonOperator
	): boolean {
		return (
			comparison === ComparisonOperator.In &&
			Is.array(conditionValue) &&
			conditionValue.includes(value)
		);
	}

	/**
	 * Compare two values which support ordering.
	 * @param value The value to test.
	 * @param conditionValue The condition value to test against.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static compareOrdered<U extends string | number>(
		value: U,
		conditionValue: U,
		comparison: ComparisonOperator
	): boolean {
		switch (comparison) {
			case ComparisonOperator.GreaterThan:
				return value > conditionValue;
			case ComparisonOperator.LessThan:
				return value < conditionValue;
			case ComparisonOperator.GreaterThanOrEqual:
				return value >= conditionValue;
			case ComparisonOperator.LessThanOrEqual:
				return value <= conditionValue;
			default:
				return EntityConditions.matchEquality(value === conditionValue, comparison);
		}
	}

	/**
	 * Compare two string values.
	 * @param value The value to test.
	 * @param conditionValue The condition value to test against.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static compareString(
		value: string,
		conditionValue: string,
		comparison: ComparisonOperator
	): boolean {
		if (comparison === ComparisonOperator.StartsWith) {
			return value.startsWith(conditionValue);
		}

		if (
			comparison === ComparisonOperator.Includes ||
			comparison === ComparisonOperator.NotIncludes
		) {
			return EntityConditions.matchInclusion(value.includes(conditionValue), comparison);
		}

		return EntityConditions.compareOrdered(value, conditionValue, comparison);
	}

	/**
	 * Compare an array value against a condition value.
	 * @param value The array to test.
	 * @param conditionValue The condition value to test against.
	 * @param comparison The comparison to perform.
	 * @returns True if the comparison is satisfied.
	 * @internal
	 */
	private static compareArray(
		value: unknown[],
		conditionValue: unknown,
		comparison: ComparisonOperator
	): boolean {
		if (Is.array(conditionValue)) {
			return EntityConditions.matchEquality(ArrayHelper.matches(value, conditionValue), comparison);
		}

		if (Is.string(conditionValue) || Is.number(conditionValue)) {
			const isIncluded = value.includes(conditionValue);
			return comparison === ComparisonOperator.In
				? isIncluded
				: EntityConditions.matchInclusion(isIncluded, comparison);
		}

		if (Is.object(conditionValue)) {
			return EntityConditions.matchInclusion(
				value.some(v => ObjectHelper.equal(v, conditionValue)),
				comparison
			);
		}

		return false;
	}
}
