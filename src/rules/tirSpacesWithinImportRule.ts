import * as ts from 'typescript';
import * as Lint from 'tslint';

const nonSpaceSymbolPattern: RegExp = /\S/;

export class Rule extends Lint.Rules.AbstractRule {
    apply (sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new RuleWalker(sourceFile, this.getOptions()));
    }
}

class RuleWalker extends Lint.RuleWalker {
    private sourceText: string;

    constructor (sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);

        this.sourceText = sourceFile.getText();
    }

    private addSpacesFailure (node: ts.ImportClause, count: number, beforeBracket?: boolean) {
        const absCount: number = Math.abs(count);
        const spacesText: string = `${ absCount } space${ absCount > 1 ? 's' : ''}`;
        const positionText: string = beforeBracket ? `before '}'` : `after '{'`;

        this.addFailureAtNode(
            node,
            `${ count > 0 ? 'Unexpected' : 'Expected' } ${ spacesText } ${ positionText }`
        );
    }

    private testCharAndCollectSpaces (
        node: ts.ImportClause,
        expectedSpacesCount: number,
        actualSpacesCount: number,
        charIndex: number,
        beforeBracket?: boolean
    ): number|undefined {
        const ch: string = this.sourceText[charIndex];

        if (ch === '\n') {
            if (actualSpacesCount) {
                this.addSpacesFailure(node, actualSpacesCount, beforeBracket);
            }

            return;
        }

        if (nonSpaceSymbolPattern.test(ch)) {
            const spacesDiff: number = actualSpacesCount - expectedSpacesCount;

            if (spacesDiff !== 0) {
                this.addSpacesFailure(node, spacesDiff, beforeBracket);
            }

            return;
        }

        return actualSpacesCount + 1;
    }

    visitImportDeclaration (node: ts.ImportDeclaration) {
        const {importClause} = node;

        if (importClause) {
            const options = this.getOptions();
            const count: number = options[0] === 'never' ? 0 : Object.assign({count: 1}, options[1]).count;
            const start: number = importClause.getStart();
            const end: number = importClause.getEnd();
            let spacesCount: number|undefined = 0;

            for (let i = start + 1; i < end; i++) {
                spacesCount = this.testCharAndCollectSpaces(importClause, count, spacesCount, i);

                if (spacesCount === undefined) {
                    break;
                }
            }

            spacesCount = 0;

            for (let i = end - 2; i > start; i--) {
                spacesCount = this.testCharAndCollectSpaces(importClause, count, spacesCount, i, true);

                if (spacesCount === undefined) {
                    break;
                }
            }
        }

        super.visitImportDeclaration(node);
    }
}