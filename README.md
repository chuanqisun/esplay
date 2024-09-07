# ESPlay

Turn browser into a buildless prototyping environment. Works with:

- React
- TypeScript/TSX/JSX

## Quickstart

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESPlay Demo</title>
    <link rel="preconnect" href="https://esm.sh" />
    <script id="dependencies" type="application/json">
      {
        "react": "^18.3.1",
        "react-dom": "^18.3.1?bundle-deps"
      }
    </script>
    <script src="https://unpkg.com/esplay" crossorigin></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      import React, { useState } from "react";
      import ReactDOM from "react-dom/client";

      function App() {
        const [count, setCount] = useState(0);
        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    </script>
  </body>
</html>
```

## Examples

- [Pomodoro Timer](./examples/pomodoro.html): React + Ant Design
- [Contact book](./examples/contact-book.html): React + MUI
- [RSS Reader](./examples/contact-book.html): Vanilla JS + RxJS

## Caveats

The following issues are under investigation. Suggestions are welcome.

- No dynamic import `import(...)`
- No relative file import `import './MyComponent`
- No Source map
