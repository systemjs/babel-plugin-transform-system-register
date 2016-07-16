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
          if (opts.moduleName && t.isArrayExpression(args[0])) {
            args.unshift(t.stringLiteral(opts.moduleName));
          }
        }
      }
    }
  };
}
