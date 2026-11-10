# omp-antigravity-fix

## Release

Toda versão nova do `package.json` que chega ao GitHub (`git push` em `main`) ganha release no GitHub e sai também no npm, na mesma entrega:

1. Commit do bump de versão e `git push origin main`.
2. Release no GitHub com tag `v<versão>` apontando para esse commit (`gh release create`, SHA completo em `--target`), notas em inglês com resumo em PT-BR, no formato das releases anteriores.
3. `npm publish` a partir do mesmo commit, com a árvore limpa.
4. Pronto quando `gh release view v<versão>` existe e `npm view omp-antigravity-fix version` retorna a versão do `package.json`.

Motivo: o README oferece o npm (`omp install omp-antigravity-fix`) como alternativa ao GitHub. Versão só no GitHub deixa quem instala pelo npm com código antigo.
