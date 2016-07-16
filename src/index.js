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

          // System.register(deps, declare)
          if (t.isArrayExpression(args[0])) {
            if (this.hasAnonRegister) {
              throw new Error('Source ' + this.name + ' has multiple anonymous System.register calls.');
            }
            this.hasAnonRegister = true;
            if (opts.moduleName) {
              args.unshift(t.stringLiteral(opts.moduleName));
            }
          }
        }
      }
    }
  };
}
