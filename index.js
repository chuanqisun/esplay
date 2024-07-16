document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    // setup import map
    const babelText = document.querySelector("script[type='text/babel']").textContent;
    const importFromPattern = /^\s*import(.+)from\s+['"](.+)['"]/gm;

    const importMatches = [...babelText.matchAll(importFromPattern)];
    const importFroms = importMatches.map((m) => m[2]);
    const imports = Object.fromEntries(importFroms.map((from) => [from, `https://esm.sh/${from}?external=react`]));

    console.log(`[esplay]`, { imports });
    const importMapsScript = document.createElement("script");
    importMapsScript.type = "importmap";
    importMapsScript.textContent = JSON.stringify({ imports: imports }, null, 2);
    document.head.appendChild(importMapsScript);

    // transpile and run
    import("https://esm.sh/esbuild-wasm@0.23.0").then(async (esbuild) => {
      await esbuild.initialize({
        wasmURL: "https://esm.sh/esbuild-wasm@0.23.0/esbuild.wasm",
      });

      // build file content map
      const sourceScripts = document.querySelectorAll(`script[type="text/babel"]`);
      sourceScripts.forEach(async (sourceScript) => {
        const result = await esbuild.transform(sourceScript.textContent, { loader: "tsx" });
        const transpiledScript = document.createElement("script");
        transpiledScript.textContent = result.code;
        transpiledScript.type = "module";
        sourceScript.insertAdjacentElement("afterend", transpiledScript);
        sourceScript.remove();
      });
    });
  }
};
