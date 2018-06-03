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
    private sourceTextLength: number;

    constructor (sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);

        this.sourceText = sourceFile.getText();
        this.sourceTextLength = sourceFile.getEnd();
    }

    visitImportDeclaration (node: ts.ImportDeclaration) {
        const options = this.getOptions();
        const always: boolean = options[0] !== 'never';
        const {count} = Object.assign({count: 1}, options[1]);
        const {sourceText, sourceTextLength} = this;
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
                this.addFailureAtNode(
                    node,
                    `Expected ${ count } empty line${ count > 1 ? 's' : ''} after import declaration`
                );
            } else if (!always && afterNewLineSymbolsCount > 1) {
                this.addFailureAtNode(node, 'Unexpected empty line after import declaration');
            }
        }

        super.visitImportDeclaration(node);
    }
}