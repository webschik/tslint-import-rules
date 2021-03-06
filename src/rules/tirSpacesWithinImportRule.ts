import * as Lint from 'tslint';
import * as ts from 'typescript';

const nonSpaceSymbolPattern: RegExp = /\S/;
type RuleOptions = string[];

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments as RuleOptions);
    }
}

function addSpacesFailure (ctx: Lint.WalkContext<RuleOptions>, node: ts.ImportClause, count: number, beforeBracket?: boolean) {
    const absCount: number = Math.abs(count);
    const spacesText: string = `${ absCount } space${ absCount > 1 ? 's' : ''}`;
    const positionText: string = beforeBracket ? `before '}'` : `after '{'`;

    ctx.addFailureAtNode(
        node,
        `${ count > 0 ? 'Unexpected' : 'Expected' } ${ spacesText } ${ positionText }`
    );
}

function testCharAndCollectSpaces (
    ctx: Lint.WalkContext<RuleOptions>,
    ch: string,
    node: ts.ImportClause,
    expectedSpacesCount: number,
    actualSpacesCount: number,
    beforeBracket?: boolean
): number|undefined {
    if (ch === '\n') {
        if (actualSpacesCount) {
            addSpacesFailure(ctx, node, actualSpacesCount, beforeBracket);
        }

        return;
    }

    if (nonSpaceSymbolPattern.test(ch)) {
        const spacesDiff: number = actualSpacesCount - expectedSpacesCount;

        if (spacesDiff !== 0) {
            addSpacesFailure(ctx, node, spacesDiff, beforeBracket);
        }

        return;
    }

    return actualSpacesCount + 1;
}

function walk(ctx: Lint.WalkContext<RuleOptions>) {
    const {sourceFile, options} = ctx;
    const sourceText: string = sourceFile.getText();

    function visitNode (node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            const {importClause} = node as ts.ImportDeclaration;

            if (importClause) {
                const count: number = options[0] === 'never' ? 0 : Object.assign({count: 1}, options[1]).count;
                const start: number = importClause.getStart();
                const end: number = importClause.getEnd();
                let spacesCount: number|undefined = 0;
                let hasOpenedBracket: boolean = false;
                let hasClosedBracket: boolean = false;

                for (let i = start; i < end; i++) {
                    const ch: string = sourceText[i];

                    if (!hasOpenedBracket && ch === '{') {
                        hasOpenedBracket = true;
                    } else if (hasOpenedBracket) {
                        spacesCount = testCharAndCollectSpaces(ctx, ch, importClause, count, spacesCount);

                        if (spacesCount === undefined) {
                            break;
                        }
                    }
                }

                spacesCount = 0;

                for (let i = end - 1; i > start; i--) {
                    const ch: string = sourceText[i];

                    if (!hasClosedBracket && ch === '}') {
                        hasClosedBracket = true;
                    } else if (hasClosedBracket) {
                        spacesCount = testCharAndCollectSpaces(ctx, ch, importClause, count, spacesCount, true);

                        if (spacesCount === undefined) {
                            break;
                        }
                    }
                }
            }

            return;
        }

        return ts.forEachChild(node, visitNode);
    }

    return ts.forEachChild(sourceFile, visitNode);
}