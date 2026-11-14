# OMP Antigravity Fix Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Cross-platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Type: OMP Native Extension](https://img.shields.io/badge/Type-OMP%20Native%20Extension-brightgreen.svg)]()

[Português (PT-BR)](#português-pt-br)

---

A clean, native [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) extension that **re-enables the Google Antigravity provider**, paused by omp in **v18.18.4** ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)).

> [!CAUTION]
> **Real risk of permanent Google account suspension. Read before installing.**
>
> - **omp paused Antigravity twice.** First in v18.18.4 ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)); resumed behind a warning on 2026-11-10 (v18.18.7, [#18499](https://github.com/can1357/oh-my-pi/issues/18499)); paused again on 2026-11-14 after a new wave of suspensions ([#19223](https://github.com/can1357/oh-my-pi/pull/19223)). **This extension lifts that pause**, so installing it removes omp's own protection.
> - **Suspensions are real and ongoing.** Reports of `403 PERMISSION_DENIED` / `TOS_VIOLATION`: [#18341](https://github.com/can1357/oh-my-pi/issues/18341), [#19222](https://github.com/can1357/oh-my-pi/issues/19222), [#19221](https://github.com/can1357/oh-my-pi/issues/19221). an omp contributor reported their own account suspended too (#19223). The author of this extension was suspended too.
> - **The suspension can hit the whole Google account**, not only omp: per [#19221](https://github.com/can1357/oh-my-pi/issues/19221), the official `agy` CLI returned the same `TOS_VIOLATION` afterwards. You can lose access to Antigravity itself.
> - **Appeals are limited.** Per Google's [support reply](https://discuss.ai.google.dev/t/account-blocked-from-antigravity-violation-of-terms-of-service-appeal-for-reinstatement/198859): one appeal per account, and repeat violations after a reinstatement are permanent. If you are reinstated, remove third-party OAuth grants before signing in again.
> - Google's Antigravity terms do not allow signing in from third-party tools like omp. Safer routes: `GEMINI_API_KEY` (AI Studio) or `google-vertex`.
>
> **Status: no longer used or tested by the author, kept online for reference only. No support, no further updates planned. Removed from npm; install from GitHub at your own risk.** Neither this project nor omp is responsible for account restrictions.

### About the omp 18.18.4 pause

Since omp 18.18.4, the `google-antigravity` auth rule carries a `disabled` reason: omp hides it from `/login`, stops refreshing its tokens, ignores stored credentials, and refuses requests. Your stored login is kept, just not used.

omp lifts that pause for any provider id an extension registers its own OAuth handler under (`providerPauseReason` in `@oh-my-pi/pi-ai`): the explicit opt-in is the user's choice. This extension registers that handler (token refresh and request credentials for `google-antigravity`) and reloads stored credentials at session start, so an existing Antigravity login works again with no new sign-in. `/login google-antigravity` keeps using omp's built-in flow. Requires omp 18.18.4 or newer; on older versions it is harmless.

omp picks the session model (the `default` role, a resumed session's model, subagent roles) before session start, while the stored Antigravity login is still hidden. So that a `google-antigravity/...` default is not replaced by another provider with the warning `Default model ... is unavailable`, the extension also registers a fallback key when a stored Antigravity login exists. omp consults it only after stored OAuth credentials, so requests always use your login.

### False 429 `RESOURCE_EXHAUSTED`

Earlier versions of this extension also removed `requestType: "agent"` from Antigravity requests: with it, Cloud Code Assist answers a masked HTTP 429 `RESOURCE_EXHAUSTED` despite free quota. omp itself stopped sending the field in 18.12.4 ([#11849](https://github.com/can1357/oh-my-pi/pull/11849)), so this extension no longer touches requests.

[#18706](https://github.com/can1357/oh-my-pi/issues/18706) reports the 429 coming back from the RFC 2119 line of omp's system prompt. On omp 18.18.6 with this extension, that line returns 200 on its own and inside the full prompt; the 429 only came back with `requestType: "agent"` added again, even with a neutral prompt. Routes that still send the field (third-party Antigravity providers) get the 429; the built-in route does not. No prompt is modified.

### Comparison with Other Workarounds

- **No Prompt Tampering**: Unlike workarounds that rename `<system-conventions>` or strip text, your prompts remain 100% intact across all providers.
- **Provider-Scoped**: Only registers auth handling for `google-antigravity`. Other providers (Anthropic, OpenAI, etc.) are never touched.
- **Zero Sidecar / Zero Daemon**: No local proxy servers running in the background, no open ports, no systemd services, and no `.vbs` startup scripts.
- **Standard Installation**: Installed with the native `omp install`, straight from GitHub.

---

### Installation

Install from GitHub with the OMP plugin manager:

```bash
omp install github:jotafurtado/omp-antigravity-fix
```

The extension loads in the next `omp` session. Confirm it is installed:

```bash
omp plugin list
```

To remove it:

```bash
omp plugin uninstall omp-antigravity-fix
```

---

### Troubleshooting: Unlocking 30-Minute Local Lock

If you already triggered a false 429, OMP may have written a 30-minute lockout entry into its local SQLite database (`agent.db`).

Clear the local lockout immediately by running:

- **Linux / macOS**:
  ```bash
  bun -e "new (require('bun:sqlite').Database)(process.env.HOME + '/.omp/agent/agent.db').query(\"DELETE FROM auth_credential_blocks WHERE provider_key='google-antigravity:oauth'\").run()"
  ```

- **Windows (PowerShell)**:
  ```powershell
  bun -e "new (require('bun:sqlite').Database)(process.env.USERPROFILE + '/.omp/agent/agent.db').query(\"DELETE FROM auth_credential_blocks WHERE provider_key='google-antigravity:oauth'\").run()"
  ```

---

### Verification

Run with a model your account's roster serves (Antigravity rosters differ per plan; `omp models google-antigravity` lists them):
```bash
omp -p --model google-antigravity/gemini-3.8-flash "reply with exactly: ok"
```
You should immediately receive `ok`. Without the extension, omp 18.18.4+ answers `No API key found for google-antigravity`.

---

## Português (PT-BR)

Uma extensão nativa e limpa para o [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) que **reativa o provedor Google Antigravity**, pausado pelo omp na **v18.18.4** ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)).

> [!CAUTION]
> **Risco real de suspensão permanente da conta Google. Leia antes de instalar.**
>
> - **O omp pausou o Antigravity duas vezes.** Primeiro na v18.18.4 ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)); retomou com aviso em 10/11/2026 (v18.18.7, [#18499](https://github.com/can1357/oh-my-pi/issues/18499)); pausou de novo em 14/11/2026 após nova onda de suspensões ([#19223](https://github.com/can1357/oh-my-pi/pull/19223)). **Esta extensão derruba essa pausa**, ou seja, instalá-la remove a proteção do próprio omp.
> - **As suspensões são reais e continuam.** Relatos de `403 PERMISSION_DENIED` / `TOS_VIOLATION`: [#18341](https://github.com/can1357/oh-my-pi/issues/18341), [#19222](https://github.com/can1357/oh-my-pi/issues/19222), [#19221](https://github.com/can1357/oh-my-pi/issues/19221). Um contribuidor do omp relatou a própria conta suspensa também (#19223). O autor desta extensão também foi suspenso.
> - **A suspensão pode atingir a conta Google inteira**, não só o omp: segundo a [#19221](https://github.com/can1357/oh-my-pi/issues/19221), o `agy` oficial devolveu o mesmo `TOS_VIOLATION` depois. Você pode perder o acesso ao próprio Antigravity.
> - **Os recursos são limitados.** Segundo a [resposta de suporte do Google](https://discuss.ai.google.dev/t/account-blocked-from-antigravity-violation-of-terms-of-service-appeal-for-reinstatement/198859): um recurso por conta, e reincidência após reintegração é permanente. Se for reintegrado, remova as concessões OAuth de terceiros antes de logar de novo.
> - Os termos do Antigravity não permitem login em ferramentas de terceiros como o omp. Alternativas mais seguras: `GEMINI_API_KEY` (AI Studio) ou `google-vertex`.
>
> **Status: o autor não usa nem testa mais; mantido no ar só como referência. Sem suporte e sem novas atualizações previstas. Removido do npm; instale pelo GitHub por sua conta e risco.** Nem este projeto nem o omp se responsabilizam por restrições na conta.

### Sobre a pausa do omp 18.18.4

Desde o omp 18.18.4, a regra de auth `google-antigravity` tem um motivo `disabled`: o omp esconde o provedor do `/login`, para de renovar os tokens, ignora as credenciais salvas e recusa as requisições. Seu login salvo continua guardado, só não é usado.

O omp libera a pausa para qualquer provedor cujo id uma extensão registre com um handler OAuth próprio (`providerPauseReason` em `@oh-my-pi/pi-ai`): o opt-in explícito é escolha do usuário. Esta extensão registra esse handler (renovação de token e credencial das requisições do `google-antigravity`) e recarrega as credenciais salvas no início da sessão, então um login existente volta a funcionar sem novo login. O `/login google-antigravity` continua usando o fluxo nativo do omp. Requer omp 18.18.4 ou mais novo; em versões antigas não tem efeito colateral.

O omp escolhe o modelo da sessão (o papel `default`, o modelo de uma sessão retomada, os papéis de subagentes) antes do início da sessão, quando o login salvo do Antigravity ainda está oculto. Para que um default `google-antigravity/...` não seja trocado por outro provedor com o aviso `Default model ... is unavailable`, a extensão também registra uma chave de fallback quando existe um login do Antigravity salvo. O omp só a consulta depois das credenciais OAuth salvas, então as requisições sempre usam o seu login.

### Falso 429 `RESOURCE_EXHAUSTED`

Versões anteriores desta extensão também removiam `requestType: "agent"` das requisições do Antigravity: com ele, o Cloud Code Assist responde HTTP 429 `RESOURCE_EXHAUSTED` mascarado mesmo com cota livre. O próprio omp deixou de enviar o campo na 18.12.4 ([#11849](https://github.com/can1357/oh-my-pi/pull/11849)), então esta extensão não mexe mais nas requisições.

A [#18706](https://github.com/can1357/oh-my-pi/issues/18706) relata a volta do 429 por causa da linha RFC 2119 do prompt de sistema do omp. No omp 18.18.6 com esta extensão, essa linha retorna 200 sozinha e dentro do prompt completo; o 429 só voltou ao adicionar `requestType: "agent"` de novo, mesmo com um prompt neutro. Rotas que ainda enviam o campo (provedores Antigravity de terceiros) recebem o 429; a rota nativa não. Nenhum prompt é alterado.

### Comparação com Outras Soluções

- **Sem Adulteração de Prompts**: Ao contrário de extensões que renomeiam `<system-conventions>` ou cortam textos, seus prompts permanecem 100% íntegros.
- **Escopada por Provedor**: Só registra o tratamento de auth do `google-antigravity`. Não afeta outros modelos (Claude, OpenAI, etc.).
- **Zero Sidecar / Sem Processos em Background**: Não requer proxy HTTP local rodando em segundo plano, nem portas abertas, nem serviços no systemd ou scripts `.vbs`.
- **Instalação Padrão**: Instalada pelo `omp install` nativo, direto do GitHub.

---

### Instalação

Instale a partir do GitHub pelo gerenciador de plugins do OMP:

```bash
omp install github:jotafurtado/omp-antigravity-fix
```

A extensão é carregada na próxima sessão do `omp`. Confirme a instalação:

```bash
omp plugin list
```

Para remover:

```bash
omp plugin uninstall omp-antigravity-fix
```

---

### Resolução: Como remover o bloqueio local de 30 minutos

Se você já recebeu um falso 429, o OMP pode ter registrado um bloqueio local de 30 minutos no banco SQLite (`agent.db`).

Para limpá-lo imediatamente e voltar a usar o Antigravity:

- **Linux / macOS**:
  ```bash
  bun -e "new (require('bun:sqlite').Database)(process.env.HOME + '/.omp/agent/agent.db').query(\"DELETE FROM auth_credential_blocks WHERE provider_key='google-antigravity:oauth'\").run()"
  ```

- **Windows (PowerShell)**:
  ```powershell
  bun -e "new (require('bun:sqlite').Database)(process.env.USERPROFILE + '/.omp/agent/agent.db').query(\"DELETE FROM auth_credential_blocks WHERE provider_key='google-antigravity:oauth'\").run()"
  ```

---

### Verificação

Use um modelo que o roster da sua conta oferece (varia por plano; `omp models google-antigravity` lista):
```bash
omp -p --model google-antigravity/gemini-3.8-flash "responda com: ok"
```
O modelo responderá imediatamente com `ok`. Sem a extensão, o omp 18.18.4+ responde `No API key found for google-antigravity`.

---

## License
[MIT](LICENSE) - Desenvolvido por [João C. Furtado (@jotafurtado)](https://github.com/jotafurtado).
