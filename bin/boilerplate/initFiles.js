
export const getPackageJson = (name, ts = false) => {
  const packageJson = {
    name: name,
    version: '0.0.1',
    description: 'Made with Love using ZilloJs',
    type: 'module',
    main: 'index.js',
    scripts: {
      "run": "node index.js",
      "test": "zillojs test",
      "shell": "zillojs shell",
    },
    dependencies: {
      "zillojs": "^0.1.0",
    },
    author: '',
    license: 'ISC',
    keywords: [],
  }

  if (ts) {
    packageJson.devDependencies = {
      "typescript": "^6.14.15",
    }
    return packageJson;
  }

  return packageJson;
}

export const getTsconfig = (name) => {
  const tsconfig = {
    "compilerOptions": {
      "target": "es6",
      "module": "commonjs",
      "moduleResolution": "node",
      "sourceMap": true,
      "declaration": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "lib": ["es6", "dom"],
      "outDir": "./dist",
      "rootDir": "./src",
      "baseUrl": "./src",
      "paths": {
        "*": ["*"],
        "src/*": ["src/*"],
        "test/*": ["test/*"],
      },
    },
  }

  return tsconfig;
}

export const getReadme = (name) => {
  return(
    `# ${name}\n` +
    `## made with ❤ using ZilloJs\n`
  )
}

export const getGitInit = () => {
  return(
    `# Automatically Generated using Zillojs\n\n`+
    `/node_modules/*/**\n`+
    `/build/*/**\n`+
    `/dist/*/**\n`
  )
}