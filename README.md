# Clube de Arte e Luta - Site Oficial (Vite)

Este projeto foi refatorado para utilizar o **Vite** como bundler, garantindo performance e facilidade de desenvolvimento. O menu mobile foi totalmente corrigido para ser 100% responsivo e funcional.

## 🚀 Como Rodar o Projeto

Para rodar o projeto localmente, siga os passos abaixo:

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O site estará disponível em `http://localhost:5173`.

3. **Gerar a versão de produção (Build):**
   ```bash
   npm run build
   ```

## ✨ Melhorias Realizadas

* **Vite Integration:** Configuração completa com TypeScript.
* **Menu Mobile Corrigido:** Implementado um menu lateral (overlay) que abre e fecha suavemente, corrigindo o problema de responsividade.
* **Projeto Social:** Nova seção dedicada às vagas filantrópicas (Segundas e Sextas) com design em Preto, Vermelho e Dourado.
* **TailwindCSS:** Utilizado via CDN para prototipagem rápida, mas pronto para ser configurado via PostCSS se necessário.
* **Smooth Scroll:** Navegação suave entre as seções da página.

## 🌐 Deploy na Vercel

O projeto está pronto para ser enviado à Vercel. O Vite detectará automaticamente as configurações de build.

## CMS na Vercel

Para o painel em `/admin/` funcionar com login e salvar alterações no GitHub, configure estas variáveis de ambiente na Vercel:

```env
CMS_GITHUB_REPO=seu-usuario-ou-org/clube-arte-luta-v2
CMS_GITHUB_BRANCH=main
CMS_SITE_URL=https://clubedearteeluta.vercel.app
OAUTH_GITHUB_CLIENT_ID=...
OAUTH_GITHUB_CLIENT_SECRET=...
OAUTH_GITHUB_SCOPE=repo
```

O que cada uma faz:

- `CMS_GITHUB_REPO`: obrigatório. Repositório que o Decap CMS vai editar.
- `CMS_GITHUB_BRANCH`: opcional. Branch usada para salvar conteúdo. Se não definir, usa `main`.
- `CMS_SITE_URL`: recomendado em produção. URL pública do site usada para gerar `base_url` e `site_domain` do CMS.
- `OAUTH_GITHUB_CLIENT_ID`: obrigatório. Client ID do GitHub OAuth App.
- `OAUTH_GITHUB_CLIENT_SECRET`: obrigatório. Client Secret do GitHub OAuth App.
- `OAUTH_GITHUB_SCOPE`: opcional. Por padrão o projeto usa `repo`. Se o repositório for público, você pode testar `public_repo`.

### GitHub OAuth App

No GitHub, crie ou ajuste um OAuth App com estes valores:

- Homepage URL: `https://clubedearteeluta.vercel.app`
- Authorization callback URL: `https://clubedearteeluta.vercel.app/oauth/callback`

Se você usar outro domínio, troque os dois campos e também o valor de `CMS_SITE_URL`.

### Checklist rápido

1. Adicione as variáveis na Vercel em `Project Settings > Environment Variables`.
2. Faça um novo deploy.
3. Abra `https://clubedearteeluta.vercel.app/admin/`.
4. Entre com GitHub e teste uma pequena edição.

Se o painel abrir mas não salvar, o problema costuma ser uma destas três coisas:

- `CMS_GITHUB_REPO` está incorreto.
- O callback do GitHub OAuth App não bate exatamente com `/oauth/callback`.
- O token não tem escopo suficiente para o tipo de repositório.

---
Desenvolvido para o **Clube de Arte e Luta**.
