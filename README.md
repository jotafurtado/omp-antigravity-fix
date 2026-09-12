# OMP Antigravity Fix Extension 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Cross-platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Type: OMP Native Extension](https://img.shields.io/badge/Type-OMP%20Native%20Extension-brightgreen.svg)]()

[English](#english) | [Português (PT-BR)](#português-pt-br)

---

## English

A clean, native [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) extension that resolves the false **HTTP 429 `RESOURCE_EXHAUSTED`** error when using **Google Antigravity** (Cloud Code Assist) models.

### 🔍 Root Cause & How It Works

1. **The Issue**: On Google Cloud Code Assist endpoints (`daily-cloudcode-pa.googleapis.com`), sending `requestType: "agent"` arms Google's internal instruction-hierarchy filter on `systemInstruction`. When the system prompt contains standard conventions with RFC 2119 keywords (`RFC 2119: MUST, REQUIRED, SHOULD...`), Google returns a masked HTTP 429 `RESOURCE_EXHAUSTED` error despite full quota availability.
2. **Official Client Parity**: The official Google Antigravity client (`antigravity/hub`) **does not send `requestType`**.
3. **The Solution**: This extension intercepts requests right before delivery (`before_provider_request`) and omits `requestType: "agent"` from the Antigravity payload.
4. **100% Prompt-Safe**: **No system prompts, conventions, or XML tags are modified, stripped, or obfuscated.** All prompts remain completely untouched.

### 🌟 Why this extension over other workarounds?

- ✅ **No Prompt Tampering**: Unlike workarounds that rename `<system-conventions>` or strip text, your prompts remain 100% intact across all providers.
- ✅ **Provider-Scoped**: Only acts on outgoing `google-antigravity` calls (`userAgent === "antigravity"`). Other providers (Anthropic, OpenAI, etc.) are never touched.
- ✅ **Zero Sidecar / Zero Daemon**: No local proxy servers running in the background, no open ports, no systemd services, and no `.vbs` startup scripts.
- ✅ **Instant 1-Command Install**: Installs directly through native `omp`.

---

### 📦 Installation

#### Option 1: Native Install (Recommended)

Run inside your terminal:

```bash
omp install github:jotafurtado/omp-antigravity-fix
```

#### Option 2: Manual Copy

Simply download or copy [`index.ts`](index.ts) into your OMP extensions folder:

- **Linux / macOS**:
  ```bash
  mkdir -p ~/.omp/agent/extensions
  curl -fsSL https://raw.githubusercontent.com/jotafurtado/omp-antigravity-fix/main/index.ts -o ~/.omp/agent/extensions/antigravity-fix.ts
  ```

- **Windows (PowerShell)**:
  ```powershell
  $extDir = "$env:USERPROFILE\.omp\agent\extensions"
  New-Item -ItemType Directory -Force -Path $extDir | Out-Null
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jotafurtado/omp-antigravity-fix/main/index.ts" -OutFile "$extDir\antigravity-fix.ts"
  ```

---

### ⚡ Troubleshooting: Unlocking 30-Minute Local Lock

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

### ✅ Verification

Run:
```bash
omp -p --model google-antigravity/gemini-3-flash "reply with exactly: ok"
```
You should immediately receive `ok` with HTTP 200.

---

## Português (PT-BR)

Uma extensão nativa e limpa para o [Oh My Pi (`omp`)](https://github.com/can1357/oh-my-pi) que resolve o erro falso de **HTTP 429 `RESOURCE_EXHAUSTED`** ao utilizar modelos do **Google Antigravity** (Cloud Code Assist).

### 🔍 Causa-Raiz e Como Funciona

1. **O Problema**: No gateway da Google (`daily-cloudcode-pa.googleapis.com`), o envio do campo `requestType: "agent"` ativa o filtro de hierarquia de instruções no `systemInstruction`. Quando o prompt contém convenções normais com termos RFC 2119 (`MUST, REQUIRED, SHOULD...`), a Google bloqueia a requisição mascarando-a como HTTP 429 `RESOURCE_EXHAUSTED`, mesmo com a cota 100% livre.
2. **Paridade com o Cliente Oficial**: O cliente oficial do Google Antigravity (`antigravity/hub`) **não envia `requestType`**.
3. **A Solução**: Esta extensão intercepta a requisição momentos antes do envio (`before_provider_request`) e omite o campo `requestType: "agent"` no envelope do Antigravity.
4. **100% Seguro para os Prompts**: **Nenhum prompt, convenção ou tag XML é alterado ou ofuscado.** Todos os prompts permanecem exatamente como foram gerados pelo OMP.

### 🌟 Por que esta extensão é superior a outras soluções?

- ✅ **Sem Adulteração de Prompts**: Ao contrário de extensões que renomeiam `<system-conventions>` ou cortam textos, seus prompts permanecem 100% íntegros.
- ✅ **Escopada por Provedor**: Atua exclusivamente em chamadas para o `google-antigravity`. Não afeta outros modelos (Claude, OpenAI, etc.).
- ✅ **Zero Sidecar / Sem Processos em Background**: Não requer proxy HTTP local rodando em segundo plano, nem portas abertas, nem serviços no systemd ou scripts `.vbs`.
- ✅ **Instalação com 1 Comando**: Instalação nativa direta pelo próprio `omp`.

---

### 📦 Instalação

#### Opção 1: Instalação Nativa (Recomendada)

Execute no terminal:

```bash
omp install github:jotafurtado/omp-antigravity-fix
```

#### Opção 2: Cópia Manual

Basta baixar ou copiar o arquivo [`index.ts`](index.ts) para a pasta de extensões do OMP:

- **Linux / macOS**:
  ```bash
  mkdir -p ~/.omp/agent/extensions
  curl -fsSL https://raw.githubusercontent.com/jotafurtado/omp-antigravity-fix/main/index.ts -o ~/.omp/agent/extensions/antigravity-fix.ts
  ```

- **Windows (PowerShell)**:
  ```powershell
  $extDir = "$env:USERPROFILE\.omp\agent\extensions"
  New-Item -ItemType Directory -Force -Path $extDir | Out-Null
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jotafurtado/omp-antigravity-fix/main/index.ts" -OutFile "$extDir\antigravity-fix.ts"
  ```

---

### ⚡ Resolução: Como remover o bloqueio local de 30 minutos

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

### ✅ Verificação

Execute:
```bash
omp -p --model google-antigravity/gemini-3-flash "responda com: ok"
```
O modelo responderá imediatamente com `ok` (HTTP 200).

---

## License
[MIT](LICENSE) - Desenvolvido por [João C. Furtado (@jotafurtado)](https://github.com/jotafurtado).
