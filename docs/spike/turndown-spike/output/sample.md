## TypeScript basics

**TypeScript** is a typed superset of JavaScript that compiles to plain JS.

Key benefits include:

-   Static typing at compile time
-   Better IDE support
    -   Autocomplete
    -   Inline documentation
-   Gradual adoption in existing JS projects

Example interface and function:

```typescript
interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

Comparison table:

| Feature | JavaScript | TypeScript |
| --- | --- | --- |
| Types | Dynamic | Static optional |
| Compile step | No | Yes (tsc) |

Learn more: [TypeScript Handbook](https://www.typescriptlang.org/docs/) and [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript).

Inline code like `const x: number = 1` should stay inline.

  

Strikethrough and task list (GFM):

~Deprecated API~ → use **v2**

-   [x]  Enable strict mode
-   [ ]  Add unit tests