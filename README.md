# ESPlay

Import any npm package into the browser without build tools.

## Quickstart

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESPlay Demo</title>
    <script src="https://unpkg.com/esplay" crossorigin></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      import React, { useState } from 'react'
      import ReactDOM from 'react-dom/client'

      function App() {
        const [count, setCount] = useState(0)
        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        )
      }

      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      )
    </script>
  </body>
</html>
```
