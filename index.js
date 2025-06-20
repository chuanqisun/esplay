function observeConsole() {
  safeAppendRootContent("Observing console...");
  const methods = ["log", "warn", "error"];
  const originals = {};

  const tryStringify = (value) => {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return `[ERROR ${e?.message}]`;
    }
  };

  methods.forEach((method) => {
    originals[method] = console[method];
    console[method] = function (...args) {
      const label = method.toUpperCase();
      const message = args.map((arg) => (typeof arg === "string" ? arg : tryStringify(arg))).join(" ");

      safeAppendRootContent(`[${label}] ${message}`);
      originals[method].apply(console, args);
    };
  });
}

function safeAppendRootContent(content) {
  const root = document.getElementById("root");
  if (root) {
    let pre = root.querySelector("pre");
    if (!pre) {
      pre = document.createElement("pre");
      root.appendChild(pre);
    }
    pre.innerHTML = `${pre.innerHTML}${content}<br/>`;
  }
}

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    safeAppendRootContent(
      `
╔════════╗
║ ESPlay ║
╚════════╝
        `.trim()
    );
    safeAppendRootContent("Scanning dependencies...");

    // setup import map
    const packageJson = JSON.parse(document.querySelector("#dependencies")?.textContent ?? "{}");
    const packageImportEntries = Object.entries(packageJson).map(([name, version]) => [name, `https://esm.sh/${name}@${version}`]);

    const babelText = document.querySelector("script[type='text/babel']").textContent;
    const importFromPattern = /^\s*import(?:.|\n)*?(?:from)?\s+['"](.+)['"]/gm;
    const allImportMatches = [...babelText.matchAll(importFromPattern)];
    const allImportNames = allImportMatches.map((m) => m[1]);

    // @scope/package-name -> [@scope/package-name]
    // package-name/subpath -> [base-package-name, /subpath]
    // package-name -> [package-name]
    const normalizedPackageNamePattern = /^(@[^/]+\/[^/]+|[^/]+)/;
    const normalizedImportEntries = allImportNames.map((name) => {
      const match = name.match(normalizedPackageNamePattern);

      // Do NOT transform external URLs
      if (!match || match[0].startsWith("https:") || match[0].startsWith("http:")) {
        safeAppendRootContent(`Skipping transform: ${name}`);
        return [name, name];
      }

      if (!match) throw new Error(`Invalid package name: ${name}`);
      const packageName = match[1];
      const packageSuffix = name.slice(packageName.length);
      const lockedVersion = packageJson[packageName] ? `@${packageJson[packageName]}` : "";
      return [name, `https://esm.sh/${packageName}${lockedVersion}${packageSuffix}`];
    });

    const imports = {
      ...Object.fromEntries(normalizedImportEntries),
      ...Object.fromEntries(packageImportEntries),
    };

    console.log(`[imports]`, imports);
    Object.entries(imports).forEach((entry) => {
      safeAppendRootContent(`Install ${entry[1]}`);
    });
    const importMapsScript = document.createElement("script");
    importMapsScript.type = "importmap";
    importMapsScript.textContent = JSON.stringify({ imports: imports }, null, 2);
    document.head.appendChild(importMapsScript);

    // transpile and run
    import("https://esm.sh/esbuild-wasm@0.24.2").then(async (pkg) => {
      const esbuild = pkg.default;
      performance.mark("esbuild-wasm:imported");
      await esbuild.initialize({
        wasmURL: "https://esm.sh/esbuild-wasm@0.24.2/esbuild.wasm",
      });

      safeAppendRootContent("Compiling...");

      observeConsole();

      // build file content map
      const sourceScripts = document.querySelectorAll(`script[type="text/babel"]`);
      sourceScripts.forEach(async (sourceScript, index) => {
        const result = await esbuild.transform(sourceScript.textContent, { loader: "tsx" });
        const transpiledScript = document.createElement("script");
        transpiledScript.textContent = result.code;
        transpiledScript.type = "module";
        sourceScript.insertAdjacentElement("afterend", transpiledScript);
        sourceScript.remove();
        safeAppendRootContent(`Rendering... ${index + 1} of ${sourceScripts.length}`);
      });
    });
  }
};
