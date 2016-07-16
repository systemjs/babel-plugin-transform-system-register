export default function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path, { opts = { systemGlobal: "System" } }) {
        if (t.isIdentifier(path.node.object, { name: "System" }) &&
            t.isIdentifier(path.node.property, { name: "register" })) {
          path.node.object.name = opts.systemGlobal;
        }
      }
    }
  };
}
