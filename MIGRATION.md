# Migração Angular para React

## Projetos

- Angular (origem, usado somente para leitura): `../locadora_rdt_frontend`
- React (resultado da migração): `../locadora_rdt_frontReact`

O projeto React preserva a organização por `core`, `shared`, `shell` e `features`. A única feature de negócio implementada no Angular de origem é `identity/users`; também existe a feature institucional `home`.

## Ambiente utilizado

- Node.js: `16.20.2`
- npm: `8.19.4`
- React: `18.3.1`
- React DOM: `18.3.1`
- TypeScript: `4.9.5`
- Build e desenvolvimento: Vite `4.5.14`

Essas versões foram escolhidas por serem compatíveis com o Node.js 16 disponível na máquina. O Node.js 16 está fora do suporte oficial; uma atualização futura do runtime permitirá atualizar o toolchain sem depender de versões legadas.

## Principais bibliotecas

- React Router DOM `6.28.2`: rotas e navegação.
- Axios `1.7.9`: comunicação HTTP e interceptor global.
- PrimeReact `9.6.5`: DataTable, Dialog, Toast, ConfirmDialog, Button e Tooltip.
- PrimeFlex `3.3.1`: classes utilitárias já utilizadas pela interface.
- Bootstrap `5.2.3`: grid, botões, offcanvas e layout.
- PrimeIcons `5.0.0` e Font Awesome `7.1.0`: mesmos conjuntos de ícones da origem.

## Equivalências Angular -> React

| Angular | React |
|---|---|
| Angular CLI / build-angular | Vite |
| NgModule e lazy modules | Estrutura por features e React Router |
| RouterModule / routerLink | React Router / Link / NavLink |
| MainComponent | MainLayout |
| HttpClient | Axios configurado em `core/http/interceptors` |
| ErrorInterceptor | interceptor de resposta do Axios |
| ErrorHandlerService | `error-handler.service.ts` e `notification.service.ts` |
| MessageService | Toast global do PrimeReact |
| ConfirmationService | ConfirmDialog global do PrimeReact |
| FormsModule / ngModel | estado local explícito com `useState` |
| ngx-mask | funções simples de máscara para telefone e CEP |
| Observable | Promise/async/await nos services |
| DomSanitizer / SafeUrl | URLs de objeto do navegador com descarte no cleanup |
| environment.ts / environment.prod.ts | `environment.ts` e `.env.production` |

## Módulos e features migrados

### Core

- configuração integral das URLs da API;
- modelos `Pagination` e `PageResponse`;
- parâmetros de paginação;
- registro e descarte de URLs de fotos;
- utilitários de seleção;
- tratamento centralizado de erros HTTP;
- página não encontrada.

### Shell e layout

- layout principal;
- navbar fixa;
- sidebar responsiva/offcanvas;
- shell de autenticação vazio mantido como equivalente ao `AuthComponent` da origem.

### Home

- hero, textos, botões e cards de jogos;
- imagem original e recortes por CSS;
- comportamento responsivo;
- link `/catalog` preservado, embora a origem também não implemente essa rota.

### Usuários

- models `User` e `Address`;
- DTOs de listagem, detalhes, inserção, atualização e endereço;
- `UserMapper`;
- `userService` com os mesmos endpoints e payloads;
- listagem paginada e filtro por nome;
- seleção de registros entre páginas;
- exclusão individual e em lote com confirmação;
- ativação/desativação;
- formulário de criação e edição;
- campos, obrigatoriedade, tamanho mínimo e mensagens do formulário;
- máscaras de telefone e CEP, enviando valores sem caracteres especiais;
- detalhes do usuário em modal;
- carregamento e tratamento de ausência de fotos;
- personalização das colunas visíveis;
- exportação Excel pelo backend;
- tabela responsiva em cards para telas menores.

## PrimeNG substituído por PrimeReact

| PrimeNG | PrimeReact |
|---|---|
| `p-table` | `DataTable` |
| `p-dialog` | `Dialog` |
| `p-toast` | `Toast` |
| `p-confirmDialog` | `ConfirmDialog` |
| `pButton` | `Button` |
| `pTooltip` | propriedade `tooltip` de `Button` |
| `pInputText` | `InputText` |

O `MultiSelectModule` era importado pelo Angular, mas não era usado por nenhuma tela. Por isso não foi adicionada uma dependência ou um componente sem uso no React.

## Autenticação e autorização

O projeto Angular analisado não possui login funcional, serviço de autenticação, JWT, armazenamento de token, authorities, guards ou interceptor de autorização. Ele contém apenas um `AuthComponent` vazio e a constante não utilizada `API.USERS.ACTIVATE`. O React mantém um `AuthLayout` equivalente, mas não inventa regras que não existem na origem.

## Diferenças inevitáveis

- templates Angular foram convertidos para JSX e estado local React;
- RxJS foi substituído por `Promise` e `async/await`;
- o isolamento de CSS por componente do Angular não existe nativamente no React. Os arquivos continuam separados por componente, com classes específicas;
- o React Router possui uma rota curinga funcional para a página não encontrada. O componente já existia no Angular, mas não estava registrado nas rotas;
- a raiz `/` redireciona para `/home`, tornando explícito o destino inicial esperado pelo menu. O Angular não declarava um redirect de raiz;
- o bundle apresenta aviso de tamanho por reunir PrimeReact, Bootstrap, Font Awesome e seus estilos, bibliotecas também presentes na origem. Não foi criada uma abstração de code splitting para manter a implementação simples.

## Funcionalidades não migradas

Nenhuma funcionalidade implementada no código Angular ficou sem equivalente. Não foram criados catálogo, autenticação, roles ou permissões porque esses recursos não existem funcionalmente no projeto de origem.

## Execução

```bash
cd locadora_rdt_frontReact
npm install
npm start
```

O frontend de desenvolvimento usa `http://localhost:8080` como API, igual ao Angular. Para alterar sem modificar código:

```bash
VITE_API_URL=http://localhost:8080 npm start
```

Build de produção:

```bash
npm run build
```

O resultado será criado em `dist/`. A configuração de produção usa `https://api.locadorardt.com`, igual ao `environment.prod.ts` da origem.

## Sincronização com Angular - 31/08/2026

Esta sincronização atualiza a migração anterior sem recriar o projeto React. O estado atual do projeto Angular foi comparado com o React e somente as funcionalidades novas ou modificadas foram implementadas.

### Features adicionadas

- `identity/roles`, com model, DTOs, mapper, service, listagem paginada, filtro e cadastro de perfil;
- gerenciamento das permissões de um perfil em modal, com grupo, filtro, seleção individual, seleção em massa e salvamento;
- `identity/permissions`, com model, DTO, mapper e service de consulta por grupo;
- item `Perfis` no menu de administração;
- rotas `/roles` e `/roles/create`.

### Usuários atualizados

- carregamento dos perfis disponíveis no formulário;
- seleção obrigatória de um ou mais perfis no cadastro e na edição;
- envio de `roleIds` nos payloads de inclusão e atualização;
- leitura de `roleIds` e `roles` no detalhamento;
- exibição dos perfis como etiquetas no modal de detalhamento.

### Endpoints adicionados

- `GET /roles`;
- `POST /roles`;
- `GET /roles/{id}`;
- `PUT /roles/{id}/permissions`;
- `GET /permissions`;
- `GET /permissions/groups`.

### Equivalências PrimeNG e PrimeReact adicionadas

| PrimeNG | PrimeReact |
|---|---|
| `p-multiSelect` | `MultiSelect` |
| `p-dropdown` | `Dropdown` |
| `p-checkbox` | `Checkbox` |
| `p-progressSpinner` | `ProgressSpinner` |

### Diferenças inevitáveis

- o estado dos formulários e modais utiliza `useState` e `useEffect` no lugar de `ngModel` e ciclos de vida Angular;
- os services usam `async/await` e a instância Axios já existente no lugar de `Observable`;
- não foram adicionados guards, autenticação ou authorities porque o Angular atual ainda não possui implementação funcional desses recursos.

## Sincronização com Angular - 21/09/2026

Esta seção descreve o estado atual e substitui, para esta versão, as observações históricas acima sobre ausência de autenticação, permissões e configurações. O conteúdo anterior foi preservado.

### Comparação e escopo

Os dois projetos foram analisados antes das alterações. A comparação considerou comportamento, campos, DTOs, endpoints, rotas, permissões, componentes compartilhados, estilos e assets, além do histórico Git do Angular até `3a4aa54`. O React existente foi atualizado incrementalmente; não foi recriado. As alterações locais que já existiam em configuração da API, ambiente, service/mapper de usuários e modal de detalhes foram preservadas.

Somente arquivos de `locadora_rdt_frontReact` foram alterados. Angular e backend foram mantidos intactos, com conferência de hashes antes e depois.

### Features e rotas adicionadas

| Feature | Rotas | Implementação React |
|---|---|---|
| Login | `/login` | `features/identity/login/pages/login-form/LoginForm.tsx` |
| Ativação de conta | `/activate?token=...` | `features/identity/activate-account/pages/activate-account/ActivateAccount.tsx` |
| Recuperação de senha | `/password-recovery` | `features/identity/password-recovery/pages/request-password-reset/RequestPasswordReset.tsx` |
| Redefinição de senha | `/password-recovery/password-reset?token=...` | `features/identity/password-recovery/pages/password-reset/PasswordReset.tsx` |
| Meu perfil | `/users/profile` | `features/identity/users/pages/user-profile-form/UserProfileForm.tsx` |
| Configurações do sistema | `/system-settings` | `features/settings/system-settings/pages/system-setting-form/SystemSettingForm.tsx` |

A raiz `/` agora redireciona para `/login`, acompanhando o Angular. Home, usuários, perfis e suas rotas anteriores foram preservados.

### Services, models e DTOs adicionados

- `core/auth`: `auth.service.ts`, `token.service.ts`, `OAuthTokenResponse` e `AuthGuard.tsx`.
- `activate-account.service.ts`: ativação com token na query string e senha no corpo.
- `password-recovery.service.ts`: solicitação por e-mail e redefinição com token.
- `user-profile.service.ts`: consulta/atualização do usuário autenticado, alteração de senha e leitura/upload de foto.
- `UserMeUpdateDTO`, `ChangePasswordDTO`, `ChangePassword` e `ChangePasswordMapper`; `UserMapper.toMeUpdateDTO` envia somente nome, e-mail, telefone e endereço.
- `system-setting.service.ts`, `SystemSetting`, `Address`, `SystemSettingDTO`, `SystemSettingUpdateDTO`, `AddressDTO`, `SystemSettingMapper` e catálogo dos mesmos 54 ícones do Angular.
- `shared/services/SessionContext.tsx`: estado compartilhado de perfil, foto e configurações, usando `useState`/`useEffect`. Substitui a comunicação entre componentes feita pelos services Angular, sem criar outra infraestrutura HTTP.

### Contratos HTTP adicionados

| Método | Endpoint | Dados |
|---|---|---|
| POST | `/oauth/token` | Form URL encoded: `username`, `password`, `grant_type=password`; Authorization Basic |
| POST | `/auth/activate` | Query `token`; corpo `{ password }` |
| POST | `/auth/request-password-reset` | `{ email }` |
| POST | `/auth/password-reset` | Query `token`; corpo `{ password }` |
| GET / PUT | `/user-profile/me` | `UserDTO` / `UserMeUpdateDTO` |
| PUT | `/user-profile/me/password` | `{ currentPassword, newPassword }` |
| GET / PUT | `/user-profile/me/photo` | Blob / multipart com campo `file` |
| GET / PUT | `/system-settings` | `SystemSettingDTO` / `{ companyName, icon, address }` |

A instância Axios existente passou a enviar Bearer token apenas para a origem configurada da API, preservando o Authorization Basic do login. A chave do localStorage é `token`, igual ao Angular. Os erros continuam no interceptor central, incluindo 401/403; ausência de foto (404/204) usa o placeholder.

### Autorização e navegação

- `SYSTEM_SETTING_READ`: acesso à rota de configurações, visibilidade da opção no menu do usuário e consulta das configurações pela sidebar.
- `SYSTEM_SETTING_WRITE`: visibilidade e execução de Salvar nas configurações.
- Leitura de authorities do JWT, verificação de expiração, login e logout.
- Assim como no Angular atual, o guard com authorities está registrado em configurações. Não foram inventadas permissões ou guards adicionais para Home, usuários ou perfis. A autorização efetiva dos endpoints continua sendo responsabilidade do backend.
- O guard React redireciona para `/login`, que é a rota existente. O guard Angular referencia `/auth/login`, inexistente no seu próprio roteamento; esse endereço quebrado não foi reproduzido.
- `/not-authorized` usa a página curinga já existente no React. A origem também não implementa uma tela específica para esse endereço.

### Interface e comportamentos atualizados

- Navbar mostra o primeiro nome e a foto do usuário, com menu PrimeReact `OverlayPanel`: Meu perfil, Configurações Sistema e Sair.
- Perfil salva os dados, depois a senha opcional e depois a foto. Falha de senha mantém o formulário aberto; falha de upload informa atualização parcial e retorna à Home, seguindo a origem.
- Fotos aceitam JPG, PNG e WEBP até 2 MB, com preview e descarte das URLs de objeto.
- Nome/foto do perfil e nome/ícone da empresa são atualizados na navbar/sidebar ao salvar, sem refresh.
- Configurações incluem endereço, limites dos campos, UF em maiúsculas, pesquisa dos 54 ícones e suporte às classes de marcas PlayStation/Xbox. Salvar e Voltar levam à Home.
- Formulário de usuários valida o preenchimento completo das máscaras de telefone/CEP, como o `ngx-mask` da origem.
- Modal de permissões mantém o filtro ao mudar de grupo, preservando a seleção entre grupos.
- Corrigido o envio de `false` na desativação de usuário: o PATCH agora declara JSON, evitando que o Axios envie corpo vazio. URL e contrato booleano foram mantidos.
- CSS das telas novas foi adaptado do Angular e delimitado por classes de página, para evitar vazamento de estilos em React. Não houve redesign nem inclusão de dependências.

### Revisão final de equivalência

| Área revisada | Resultado |
|---|---|
| Home, imagens e responsividade | Preservadas; assets utilizados já eram equivalentes |
| Usuários | Listagem, filtros, paginação, seleção, exclusões, ativação, detalhes, cadastro/edição e perfis preservados; máscaras e PATCH ajustados |
| Perfis e permissões | Cadastro, listagem, modal, grupos, filtro e seleção preservados; filtro entre grupos corrigido |
| Autenticação e recuperação | Telas, token, campos, mensagens principais e chamadas implementados |
| Meu perfil | Dados, endereço, senha opcional, upload, preview e atualização da navbar implementados |
| Configurações | Campos, DTOs, leitura/escrita, authorities, busca de ícones, sidebar e navegação implementados |
| Compartilhados | Tabela, confirmação, mensagens, personalização de colunas e exportação Excel reutilizados |
| Contratos e rotas | Todas as páginas e campos de models/DTOs da origem possuem equivalentes necessários |

Não foram identificadas features Angular implementadas sem correspondente React após a segunda comparação. Métodos internos de RxJS/ciclo de vida não exigem cópia literal: seus efeitos são realizados com estado React, cleanup e `async/await`.

### Diferenças técnicas e configuração preservada

- A API local do React continua com o fallback preexistente `http://localhost:8081`; use `VITE_API_URL` para apontar para outra porta/ambiente. Não foi trocada indiscriminadamente para a porta do Angular.
- `VITE_OAUTH_BASIC_AUTH` permite configurar o cabeçalho Basic do cliente OAuth; o fallback acompanha o ambiente Angular de desenvolvimento.
- CSS é isolado por classes, formulários usam estado React, PrimeNG usa os equivalentes PrimeReact já instalados e services retornam Promises.
- Erros HTTP são apresentados centralmente, evitando duplicar o toast que a redefinição de senha Angular também apresenta no componente.
- Botões de envio das telas novas bloqueiam requisições repetidas enquanto salvam.
- O link `/catalog` da Home continua sem feature de destino porque o Angular também não implementa catálogo.
- A validação dos campos de usuários/perfil acompanha o Angular: e-mail obrigatório nessas telas; recuperação de senha utiliza o mesmo validador de formato do Angular. Não foram acrescentadas restrições de e-mail ausentes da referência.

### Validação

- `npm run build`: TypeScript e build de produção aprovados. Permanece o aviso de bundle acima de 500 kB, já existente no projeto.
- Não há script de lint nem framework de testes configurado no `package.json`; nenhuma dependência foi instalada ou atualizada.
- `node scripts/sync-smoke.mjs`: verificação em Chrome headless com API simulada local, sem acessar o backend real. Usa Node/Vite já instalados; requer Chrome (`CHROME_BIN` pode indicar outro executável compatível).
- Fluxos verificados: login/Basic/Bearer, sessão/foto ausente, salvar configurações e pesquisar ícones, atualização imediata da sidebar, perfil/senha/upload multipart, atualização da navbar, falha parcial de senha, filtro/seleção entre grupos de permissões, READ/WRITE, Voltar, token expirado, PATCH booleano, ativação, confirmação de senha, recuperação/redefinição, erro HTTP, largura mobile e logout.
- Integração com o backend real e envio real de e-mail não foram executados. A validação dos contratos e fluxos usa respostas simuladas.

### Ajuste da conexão local após a sincronização

O fallback de `src/environments/environment.ts` foi ajustado de `http://localhost:8081` para `http://localhost:8080`, após confirmar que o backend local escuta na porta 8080. A configuração anterior causava `ERR_CONNECTION_REFUSED` no login. `VITE_API_URL` continua tendo prioridade e a configuração de produção foi preservada.
