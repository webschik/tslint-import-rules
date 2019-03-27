import * as Lint from 'tslint';
import * as ts from 'typescript';

const nonSpaceSymbolPattern: RegExp = /\S/;

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>) {
    const {sourceFile} = ctx;
    const sourceText: string = sourceFile.getText();
    const sourceTextLength: number = sourceFile.getEnd();

    function visitNode (node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
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

            if (isAfterImportDeclaration && (afterNewLineSymbolsCount > 1)) {
                ctx.addFailureAtNode(node, 'Unexpected empty line between import declarations');
            }

            return;
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(sourceFile, visitNode);
}