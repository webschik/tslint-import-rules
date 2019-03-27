import * as Lint from 'tslint';
import * as ts from 'typescript';

const nonSpaceSymbolPattern: RegExp = /\S/;
type RuleOptions = string[];

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments as RuleOptions);
    }
}

function walk(ctx: Lint.WalkContext<RuleOptions>) {
    const {sourceFile, options} = ctx;
    const sourceText: string = sourceFile.getText();
    const sourceTextLength: number = sourceFile.getEnd();

    function visitNode (node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const always: boolean = options[0] !== 'never';
            const {count} = Object.assign({count: 1}, options[1]);
            let isAfterImportDeclaration: boolean = false;
            let afterNewLineSymbolsCount: number = 0;

            for (let i = node.getEnd(); i < sourceTextLength; i++) {
                const ch: string = sourceText[i];

                if (ch === '\n') {
                    afterNewLineSymbolsCount++;
                } else if (nonSpaceSymbolPattern.test(ch)) {
                    isAfterImportDeclaration = sourceText.slice(i, i + 6) === 'import';
                    break;
                }
            }

            if (!isAfterImportDeclaration) {
                if (always && (count !== afterNewLineSymbolsCount - 1)) {
                    ctx.addFailureAtNode(
                        node,
                        `Expected ${ count } empty line${ count > 1 ? 's' : ''} after import declaration`
                    );
                } else if (!always && afterNewLineSymbolsCount > 1) {
                    ctx.addFailureAtNode(node, 'Unexpected empty line after import declaration');
                }
            }

            return;
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(sourceFile, visitNode);
}