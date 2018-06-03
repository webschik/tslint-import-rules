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

        if (isAfterImportDeclaration && (afterNewLineSymbolsCount > 1)) {
            this.addFailureAtNode(node, 'Unexpected empty line between import declarations');
        }

        super.visitImportDeclaration(node);
    }
}