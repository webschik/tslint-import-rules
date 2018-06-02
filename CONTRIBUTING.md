### Contributing Code
- Pick the rule name you will be working on and add the `tir` prefix. For example, `tir-newline-after-import`.
  This is to avoid future name collision.
- Create a branch with the rule name, e.g. `tir-newline-after-import`.
- If you haven't, run `npm install` to download the project dependencies.
- Create your rule tests at `./test/rules` and your rule in `./src/rules` 

### Commit conventions
Each commit should follow the following convention:

```
[feat] added tir-newline-after-import rule (closes #1)
Other commit messages include
```

- `[bug] fixed tir-newline-after-import rule (closes #2)`
- `[docs] improved README.md file (closes #3)`
- `[perf] improved tir-newline-after-import rule (closes #4)`