module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure reactive variables ($:) are declared (with type if possible)',
            recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
            undeclaredVar:
                "Reactive variable '{{name}}' is not declared. Declare it with 'let' or 'const'.",
        },
    },

    create(context) {
        let declaredVars = new Set();
        return {
            Program(programNode) {
                const scriptNode = programNode.body.find(n => n.type === 'SvelteScriptElement');
                if (!scriptNode?.body) return;

                for (const stmt of scriptNode.body) {
                    if (stmt.type === 'VariableDeclaration') {
                        for (const decl of stmt.declarations) {
                            if (decl.id.type === 'Identifier') {
                                declaredVars.add(decl.id.name);
                            }
                        }
                    }

                    if (
                        stmt.type === 'ExportNamedDeclaration' &&
                        stmt.declaration?.type === 'VariableDeclaration'
                    ) {
                        for (const decl of stmt.declaration.declarations) {
                            if (decl.id.type === 'Identifier') {
                                declaredVars.add(decl.id.name);
                            }
                        }
                    }
                }
            },
            SvelteReactiveStatement(node) {
                const expression = node.body;
                if (
                    expression?.type === 'ExpressionStatement' &&
                    expression.expression.type === 'AssignmentExpression' &&
                    expression.expression.left.type === 'Identifier'
                ) {
                    const right = expression.expression.right;
                    if (
                        right.type === 'CallExpression' ||
                        right.type === 'Identifier' ||
                        right.type === 'FunctionExpression' ||
                        right.type === 'ArrowFunctionExpression'
                    ) {
                        return;
                    }

                    const name = expression.expression.left.name;
                    if (declaredVars.has(name)) {
                        return;
                    }
                    const rootName = getRootIdentifier(right);
                    if (rootName === 'data') {
                        return;
                    }
                    context.report({
                        node: expression.expression.left,
                        messageId: 'undeclaredVar',
                        data: { name },
                        fix(fixer) {
                            const varName = expression.expression.left.name;
                            const fullReactiveStatement = node;
                            if (!fullReactiveStatement.range) return null;
                            const insertPos = fullReactiveStatement.range[0];
                            const inferredType = inferType(expression.expression.right);
                            const declaration = `    let ${varName}: ${inferredType};\n`;
                            return fixer.insertTextBeforeRange([insertPos, insertPos], declaration);
                        }
                    });
                }
            },
        };
    },
};

function getRootIdentifier(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'MemberExpression') return getRootIdentifier(node.object);
    return null;
}

function inferType(node) {
    switch (node.type) {
        case 'Literal':
            if (typeof node.value === 'string') return 'string';
            if (typeof node.value === 'number') return 'number';
            if (typeof node.value === 'boolean') return 'boolean';
            return 'any';
        case 'ArrayExpression': {
            const elements = node.elements || [];
            if (elements.length === 0) return 'any[]';
            const firstType = inferType(elements[0]);
            for (let i = 1; i < elements.length; i++) {
                if (inferType(elements[i]) !== firstType) {
                    return 'any[]';
                }
            }
            return `${firstType}[]`;
        }
        case 'ObjectExpression':
            return 'Record<string, any>';
        case 'Identifier':
            return 'any';
        case 'ConditionalExpression': {
            const t1 = inferType(node.consequent);
            const t2 = inferType(node.alternate);
            return t1 === t2 ? t1 : 'any';
        }
        case 'LogicalExpression':
        case 'BinaryExpression': {
            const logicalOps = ['==', '===', '!=', '!==', '<', '<=', '>', '>='];
            if (logicalOps.includes(node.operator)) return 'boolean';
            const left = inferType(node.left);
            const right = inferType(node.right);
            return left === right ? left : 'any';
        }
        case 'UnaryExpression':
            if (node.operator === '!') return 'boolean';
            return 'any';
        default:
            return 'any';
    }
}