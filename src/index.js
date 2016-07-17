const findModuleNameVisitor = {
  Identifier({ node }) {
    if (node.name === '__moduleName')
      this.usesModuleName = true;
  }
};

// converts anonymous System.register([] into named System.register('name', [], ...
// NB need to add that if no anon, last named must define this module
export default function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path, { opts = {} }) {
        const callee = path.node.callee;
        const args = path.node.arguments;
        if (t.isMemberExpression(callee) &&
            t.isIdentifier(callee.object, { name: 'System' }) &&
            t.isIdentifier(callee.property, { name: 'register' })) {
          callee.object.name = opts.systemGlobal || 'System';

          const firstArg = args[0];
          let declare = args[1];

          // System.register(deps, declare)
          if (t.isArrayExpression(firstArg)) {
            if (this.hasAnonRegister)
              throw new Error(`Source ${this.name} has multiple anonymous System.register calls.`);

            // normalize dependencies in array
            // NB add metadata.deps here too
            if (typeof opts.map === 'function') {
              firstArg.elements.forEach(e => {
                e.value = opts.map(e.value);
              });
            }

            this.hasAnonRegister = true;

            if (opts.moduleName) {
              args.unshift(t.stringLiteral(opts.moduleName));
            }
          }
          // System.register(name, deps, declare)
          else {
            declare = args[2];
          }

          // contains a __moduleName reference, while System.register declare function doesn't have a __moduleName argument
          // so add it
          // this is backwards compatibility for https://github.com/systemjs/builder/issues/416
          if (t.isFunctionExpression(declare) && declare.params.length === 1) {
            const state = {};
            path.traverse(findModuleNameVisitor, state);
            if (state.usesModuleName) {
              declare.params.push(t.identifier('__moduleName'));
            }
          }
        }
      },
      Program: {
        exit() {
          // if the transformer didn't find an anonymous System.register
          // then this is a bundle itself
          // so we need to reconstruct files with load.metadata.execute etc
          // if this comes up, we can tackle it or work around it
          if (!this.hasAnonRegister)
            throw new TypeError(`Source ${this.name} is already a bundle file, so can't be built as a module.`);
        }
      }
    }
  };
}
