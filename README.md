# OMP Antigravity Fix Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Cross-platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Type: OMP Native Extension](https://img.shields.io/badge/Type-OMP%20Native%20Extension-brightgreen.svg)]()

[English](#english) | [Português (PT-BR)](#português-pt-br)

---

## English

A clean, native [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) extension that:

1. **Re-enables the Google Antigravity provider**, paused by omp in **v18.18.4** ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)).
2. Resolves the false **HTTP 429 `RESOURCE_EXHAUSTED`** error on **Google Antigravity** (Cloud Code Assist) models.

> [!WARNING]
> **Use at your own risk.** omp paused Antigravity because Google may restrict or ban accounts that use Antigravity outside its own apps; Google's Antigravity terms treat third-party clients using your Antigravity login as a ToS violation. By installing this extension you accept that risk for your Google account. Neither this project nor omp is responsible for account restrictions.

### About the omp 18.18.4 pause

Since omp 18.18.4, the `google-antigravity` auth rule carries a `disabled` reason: omp hides it from `/login`, stops refreshing its tokens, ignores stored credentials, and refuses requests. Your stored login is kept, just not used.

omp lifts that pause for any provider id an extension registers its own OAuth handler under (`providerPauseReason` in `@oh-my-pi/pi-ai`): the explicit opt-in is the user's choice. This extension registers that handler (token refresh and request credentials for `google-antigravity`) and reloads stored credentials at session start, so an existing Antigravity login works again with no new sign-in. `/login google-antigravity` keeps using omp's built-in flow. Requires omp 18.18.4 or newer; on older versions it is harmless.

### Root Cause & How It Works

1. **The Issue**: On Google Cloud Code Assist endpoints (`daily-cloudcode-pa.googleapis.com`), sending `requestType: "agent"` arms Google's internal instruction-hierarchy filter on `systemInstruction`. When the system prompt contains standard conventions with RFC 2119 keywords (`RFC 2119: MUST, REQUIRED, SHOULD...`), Google returns a masked HTTP 429 `RESOURCE_EXHAUSTED` error despite full quota availability.
2. **Official Client Parity**: The official Google Antigravity client (`antigravity/hub`) **does not send `requestType`**.
3. **The Solution**: This extension intercepts requests right before delivery (`before_provider_request`) and omits `requestType: "agent"` from the Antigravity payload.
4. **100% Prompt-Safe**: **No system prompts, conventions, or XML tags are modified, stripped, or obfuscated.** All prompts remain completely untouched.

### Comparison with Other Workarounds

- **No Prompt Tampering**: Unlike workarounds that rename `<system-conventions>` or strip text, your prompts remain 100% intact across all providers.
- **Provider-Scoped**: Only acts on outgoing `google-antigravity` calls (`userAgent === "antigravity"`). Other providers (Anthropic, OpenAI, etc.) are never touched.
- **Zero Sidecar / Zero Daemon**: No local proxy servers running in the background, no open ports, no systemd services, and no `.vbs` startup scripts.
- **Multiple Installation Options**: Supports both clean directory cloning and native `omp install`.

---

### Installation

Clone this repository into the extensions directory:

**Windows (CMD)**:
```cmd
git clone https://github.com/jotafurtado/omp-antigravity-fix "%USERPROFILE%/.omp/agent/extensions/antigravity-fix"
```

**Windows (PowerShell)**:
```powershell
git clone https://github.com/jotafurtado/omp-antigravity-fix "$HOME/.omp/agent/extensions/antigravity-fix"
```

**Linux / macOS**:
```bash
git clone https://github.com/jotafurtado/omp-antigravity-fix "$HOME/.omp/agent/extensions/antigravity-fix"
```

Alternatively, you can install it using the native extension manager:
```bash
omp install github:jotafurtado/omp-antigravity-fix
```

---

### Troubleshooting: Unlocking 30-Minute Local Lock

If you already triggered the false 429 prior to installing this extension, OMP may have written a 30-minute lockout entry into its local SQLite database (`agent.db`).

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
omp -p --model google-antigravity/claude-sonnet-4-6 "reply with exactly: ok"
```
You should immediately receive `ok`. Without the extension, omp 18.18.4+ answers `No API key found for google-antigravity`.

---

## Português (PT-BR)

Uma extensão nativa e limpa para o [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) que:

1. **Reativa o provedor Google Antigravity**, pausado pelo omp na **v18.18.4** ([#18622](https://github.com/can1357/oh-my-pi/pull/18622)).
2. Resolve o erro falso de **HTTP 429 `RESOURCE_EXHAUSTED`** nos modelos do **Google Antigravity** (Cloud Code Assist).

> [!WARNING]
> **Use por sua conta e risco.** O omp pausou o Antigravity porque a Google pode restringir ou banir contas que usam o Antigravity fora dos apps dela; os termos do Antigravity tratam o uso do seu login em clientes de terceiros como violação. Ao instalar esta extensão você assume esse risco para a sua conta Google. Nem este projeto nem o omp se responsabilizam por restrições na conta.

### Sobre a pausa do omp 18.18.4

Desde o omp 18.18.4, a regra de auth `google-antigravity` tem um motivo `disabled`: o omp esconde o provedor do `/login`, para de renovar os tokens, ignora as credenciais salvas e recusa as requisições. Seu login salvo continua guardado, só não é usado.

O omp libera a pausa para qualquer provedor cujo id uma extensão registre com um handler OAuth próprio (`providerPauseReason` em `@oh-my-pi/pi-ai`): o opt-in explícito é escolha do usuário. Esta extensão registra esse handler (renovação de token e credencial das requisições do `google-antigravity`) e recarrega as credenciais salvas no início da sessão, então um login existente volta a funcionar sem novo login. O `/login google-antigravity` continua usando o fluxo nativo do omp. Requer omp 18.18.4 ou mais novo; em versões antigas não tem efeito colateral.

### Causa-Raiz e Como Funciona

1. **O Problema**: No gateway da Google (`daily-cloudcode-pa.googleapis.com`), o envio do campo `requestType: "agent"` ativa o filtro de hierarquia de instruções no `systemInstruction`. Quando o prompt contém convenções normais com termos RFC 2119 (`MUST, REQUIRED, SHOULD...`), a Google bloqueia a requisição mascarando-a como HTTP 429 `RESOURCE_EXHAUSTED`, mesmo com a cota 100% livre.
2. **Paridade com o Cliente Oficial**: O cliente oficial do Google Antigravity (`antigravity/hub`) **não envia `requestType`**.
3. **A Solução**: Esta extensão intercepta a requisição momentos antes do envio (`before_provider_request`) e omite o campo `requestType: "agent"` no envelope do Antigravity.
4. **100% Seguro para os Prompts**: **Nenhum prompt, convenção ou tag XML é alterado ou ofuscado.** Todos os prompts permanecem exatamente como foram gerados pelo OMP.

### Comparação com Outras Soluções

- **Sem Adulteração de Prompts**: Ao contrário de extensões que renomeiam `<system-conventions>` ou cortam textos, seus prompts permanecem 100% íntegros.
- **Escopada por Provedor**: Atua exclusivamente em chamadas para o `google-antigravity`. Não afeta outros modelos (Claude, OpenAI, etc.).
- **Zero Sidecar / Sem Processos em Background**: Não requer proxy HTTP local rodando em segundo plano, nem portas abertas, nem serviços no systemd ou scripts `.vbs`.
- **Múltiplas Formas de Instalação**: Suporta clonagem direta de diretório ou instalação nativa pelo `omp install`.

---

### Instalação

Clone este repositório no diretório de extensões:

**Windows (CMD)**:
```cmd
git clone https://github.com/jotafurtado/omp-antigravity-fix "%USERPROFILE%/.omp/agent/extensions/antigravity-fix"
```

**Windows (PowerShell)**:
```powershell
git clone https://github.com/jotafurtado/omp-antigravity-fix "$HOME/.omp/agent/extensions/antigravity-fix"
```

**Linux / macOS**:
```bash
git clone https://github.com/jotafurtado/omp-antigravity-fix "$HOME/.omp/agent/extensions/antigravity-fix"
```

Alternativamente, você pode instalar utilizando o gerenciador de extensões nativo:
```bash
omp install github:jotafurtado/omp-antigravity-fix
```

---

### Resolução: Como remover o bloqueio local de 30 minutos

Se você recebeu o erro 429 antes de instalar esta extensão, o OMP pode ter registrado um bloqueio local de 30 minutos no banco SQLite (`agent.db`).

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
omp -p --model google-antigravity/claude-sonnet-4-6 "responda com: ok"
```
O modelo responderá imediatamente com `ok`. Sem a extensão, o omp 18.18.4+ responde `No API key found for google-antigravity`.

---

## License
[MIT](LICENSE) - Desenvolvido por [João C. Furtado (@jotafurtado)](https://github.com/jotafurtado).
