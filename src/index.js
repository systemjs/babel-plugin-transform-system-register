export default function ({ types: t }) {
  return {
    visitor: {
      CallExpression(path, { opts = {} }) {
        var callee = path.node.callee;
        var args = path.node.arguments;
        if (t.isMemberExpression(callee) &&
            t.isIdentifier(callee.object, { name: 'System' }) &&
            t.isIdentifier(callee.property, { name: 'register' })) {
          callee.object.name = opts.systemGlobal || 'System';

          const firstArg = args[0];

          // System.register(deps, declare)
          if (t.isArrayExpression(firstArg)) {
            if (this.hasAnonRegister) {
              throw new Error(`Source ${this.name} has multiple anonymous System.register calls.`);
            }

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
