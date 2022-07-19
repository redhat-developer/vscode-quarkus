### List of supported default Qute resolvers from the [Qute Reference Guide](https://quarkus.io/guides/qute-reference):

Below is a list of default value resolvers supported in Qute templates:

#### [Built-in Resolvers](https://quarkus.io/guides/qute-reference#built-in-resolvers)
- `ifTruthy(base : T, arg : java.lang.Object) : T` - Outputs the default value if the base object cannot be resolved or the base Object otherwise.
```
{item.isActive.ifTruthy(item.name)}
```

- `orEmpty(base : java.lang.Iterable<T>) : java.util.List<T>` - Outputs an empty list if the previous part cannot be resolved or resolves to null.
```
{#for pet in pets.orEmpty}
  {pet.name}
{/for}
```

- `orEmpty(base : T) : java.util.List<T>` - Outputs an empty list if the previous part cannot be resolved or resolves to null.
```
{#for pet in pets.orEmpty}
  {pet.name}
{/for}
```

- `or(base : T, arg : java.lang.Object) : T` - Outputs the default value if the previous part cannot be resolved or resolves to null.
```
{person.name ?: 'John'}
{person.name or 'John'}
{person.name.or('John')}
```

#### [Arrays](https://quarkus.io/guides/qute-reference#arrays)
- `length(base : T[]) : int` - The length of the array.
```
{myArray.length}
```

- `size(base : T[]) : int` - The size of the array.
```
{myArray.size}
```

- `get(base : T[], index : int) : T` - Returns the element at the specified `index` from the given array.
```
{myArray.get(0)}
```

- `take(base : T[], n : int) : T[]` - Returns the first `n` elements from the given array; throws an `IndexOutOfBoundsException` if `n` is out of range.
```
{#for r in myArray.take(3)}
```

- `takeLast(base : T[], n : int) : T[]` - Returns the last `n` elements from the given list; throws an `IndexOutOfBoundsException` if `n` is out of range.
```
{#for r in myArray.takeLast(3)}
```

- `@java.lang.Integer(base : T[]) : T` - Returns the element at the specified `index` from the given array.
```
{myArray.0}
```

#### [Character Escapes](https://quarkus.io/guides/qute-reference#character-escapes)
- `raw(base : java.lang.Object) : io.quarkus.qute.RawString` - Marks the object so that character escape is not needed and can be rendered as is.
```
{paragraph.raw}
```

- `safe(base : java.lang.Object) : io.quarkus.qute.RawString` - Marks the object so that character escape is not needed and can be rendered as is.
```
{paragraph.safe}
```

#### [Virtual Methods](https://quarkus.io/guides/qute-reference#virtual_methods)
- A virtual method is a part of an expression that looks like a regular Java method invocation. It’s called "virtual" because it does not have to match the actual method of a Java class. In fact, like normal properties a virtual method is also handled by a value resolver. The only difference is that for virtual methods a value resolver consumes parameters that are also expressions.

Virtual method usage:
```
{item.buildName(item.name,5)}
```

Virtual method definition:
```java
class Item {
   String buildName(String name, int age) {
      return name + ":" + age;
   }
}
```

#### [Maps](https://quarkus.io/guides/qute-reference#maps)
- `size(base : @java.util.Map<T, T>) : int` - The size of the map.
```
{myMap.size}
```

#### [Collections](https://quarkus.io/guides/qute-reference#collections)
- `take(base : java.util.List<T>, n : int) : java.util.List<T>` - Returns the first n elements from the given list; throws an IndexOutOfBoundsException if n is out of range
```
{#for r in recordsList.take(3)}
```

- `@java.lang.Integer(base : java.util.List<T>) : T` - Returns the element at the specified `index` from the given list.
```
{myList.0}
```

#### [Numbers](https://quarkus.io/guides/qute-reference#numbers)
- `mod` - Modulo operation
```
{#if counter.mod(5) == 0}
```

#### [Time](https://quarkus.io/guides/qute-reference#time)
- `format(pattern)` - Formats temporal objects from the `java.time` package.
```
{dateTime.format('d MMM uuuu')}
```

- `format(pattern, locale)` - Formats temporal objects from the `java.time` package.
```
{dateTime.format('d MMM uuuu',myLocale)}
```

- `format(pattern, locale, timeZone)` - Formats temporal objects from the `java.time` package.
```
{dateTime.format('d MMM uuuu',myLocale,myTimeZoneId)}
```
