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

## Sincronização com Angular - 23/09/2026

Atualização incremental baseada no estado atual de `../locadora_rdt_frontend`, incluindo o histórico até `78acf9d` e os arquivos presentes no diretório de trabalho. O React existente foi preservado como referência arquitetural. Esta seção atualiza as observações históricas sobre ausência de clientes, cadastro público e guards.

### Comparação inicial

Foram comparados estrutura, páginas, componentes, rotas, guards, authorities, menus, DTOs, models, mappers, métodos HTTP, parâmetros, arquivos binários, formulários, validações, estilos, assets e componentes compartilhados. O histórico Git ajudou a localizar mudanças, mas os contratos e comportamentos foram conferidos no código atual.

Diferenças encontradas:

- O React não possuía a feature `organization/customers`: CRUD, fotos, detalhes, anexos e exportação de clientes.
- O React não possuía `identity/customer-account`: cadastro público, criação de senha e reenvio de ativação.
- Faltavam as proteções atuais das rotas de usuários, perfis e clientes, a página `not-authorized` e o destino explícito `page-not-found`.
- O menu não refletia as regras atuais de visibilidade e não tinha Organização / Clientes.
- A listagem de usuários não recebia as roles nem impedia selecionar/excluir quem tem `ROLE_ADMINISTRADOR`.
- A tabela compartilhada precisava oferecer seleção opcional, seleção condicionada e paginação opcional.
- O interceptor precisava excluir as três chamadas públicas de cadastro do envio de Bearer token.

As alterações locais anteriores em ambiente, login, ativação, redefinição de senha e modal de permissões foram preservadas. Nenhuma dependência foi instalada ou atualizada.

### Features adicionadas

**Clientes (`organization/customers`)**

- Listagem com filtro por nome, paginação, seleção entre páginas, exclusão individual/em lote, ativação/desativação, personalização de colunas e exportação Excel pela infraestrutura existente.
- Cadastro/edição com nome, CPF, e-mail, telefone, endereço e foto. Nome mínimo de cinco caracteres, campos obrigatórios e máscaras de telefone/CEP seguem a referência.
- Upload de foto separado do salvamento; falha da foto informa o cadastro/atualização parcial, como no Angular.
- Modal de detalhes com endereço, auditoria, situação e foto.
- Modal de arquivos com nome, seleção de arquivo, preview de imagens, envio multipart, listagem, visualização de imagem/PDF, download e exclusão com confirmação.
- Download preserva o nome original ou o nome fornecido em `Content-Disposition`, incluindo UTF-8.
- URLs de objeto são liberadas ao trocar arquivo, fechar modal ou desmontar os componentes.

**Conta de cliente (`identity/customer-account`)**

- Cadastro público com os mesmos onze campos, payload plano, validações de CPF/e-mail/UF e mensagens.
- Redirecionamento após cadastro para reenvio de ativação com e-mail preenchido pela query string.
- Criação de senha com token na query, mínimo de seis caracteres, confirmação e aviso de token ausente.
- Reenvio de ativação com validação de e-mail e mensagem de sucesso.
- Layout do Angular atual: fundo lilás, cartão branco, ícones nos inputs, botões e grid responsivo do cadastro. CSS delimitado por classes para reproduzir o isolamento de estilos do Angular.
- Link “Ainda não é um cliente?” no login.

### Rotas e permissões

| Rota | Regra |
|---|---|
| `/customer-account` | Redireciona para `/customer-account/register` |
| `/customer-account/register` | Pública |
| `/customer-account/create-password?token=...` | Pública |
| `/customer-account/resend?email=...` | Pública |
| `/customers` | `CUSTOMER_READ` |
| `/customers/create` | `CUSTOMER_WRITE` |
| `/customers/:customerId/edit` | `CUSTOMER_WRITE` |
| `/users` | `USER_READ` |
| `/users/create`, `/users/:userId/edit` | `USER_WRITE` |
| `/users/profile` | `USER_PROFILE_READ` |
| `/roles` | `ROLE_READ` |
| `/roles/create` | `ROLE_WRITE` |
| `/system-settings` | `SYSTEM_SETTING_READ` (preservada) |
| `/not-authorized` | Página “Acesso negado!” |
| `/page-not-found` e rota curinga | Página não encontrada |

- Sessão inválida leva ao login com `returnUrl`; falta de authority leva à página de acesso negado com aviso.
- Clientes: leitura permite detalhes/anexos/download; escrita permite criar/editar/alterar situação/enviar arquivos; exclusão permite excluir clientes/arquivos e selecionar clientes em lote.
- Usuários: `ROLE_ADMINISTRADOR` ou `USER_DELETE` habilita exclusão, mas um alvo com `ROLE_ADMINISTRADOR` permanece protegido mesmo quando possui outras roles. A regra vale para botão individual e seleção em lote; o backend continua responsável pela autorização definitiva.
- A visibilidade dos grupos Administração e Organização e do item Perfis acompanha o Angular atual. Não foram criadas permissões novas no backend.

### Services, models, DTOs e mappers

- `customer.service.ts`: listagem, consulta, inserção, atualização, exclusão individual/em lote, situação e foto.
- `customer-file.service.ts`: listagem, envio, visualização, download com cabeçalhos e exclusão de anexos.
- `customer-account.service.ts`: cadastro, criação de senha e reenvio de ativação.
- Models `Customer`, `CustomerFile`, `Address`, `CustomerAccountRegistration`, `CustomerAccountPassword` e `CustomerAccountResend`.
- DTOs de cliente (listagem, detalhes, inserção, atualização, endereço e arquivo) e os três DTOs de conta de cliente; respectivos mappers no padrão `mappers` já existente no React.
- `UserDTO.roles` e `UserMapper.toModel` atualizados para refletir as roles da listagem.

### Contratos HTTP acrescentados

| Método | Endpoint | Contrato |
|---|---|---|
| GET / POST | `/customers` | Paginação/filtro `name` / `CustomerInsertDTO` |
| GET / PUT / DELETE | `/customers/{id}` | Detalhes / `CustomerUpdateDTO` / exclusão |
| DELETE | `/customers/all` | Array de IDs no corpo |
| PATCH | `/customers/{id}/active` | Booleano JSON, inclusive `false` |
| GET / PUT | `/customers/{id}/photo` | Blob / multipart com `file` |
| GET / POST | `/customers/{id}/files` | Lista / multipart com `name` e `file` |
| DELETE | `/customers/{id}/files/{fileId}` | Exclusão |
| GET | `/customers/{id}/files/{fileId}/view` | Blob para visualização |
| GET | `/customers/{id}/files/{fileId}/download` | Blob e cabeçalhos |
| POST | `/customer-accounts` | `CustomerAccountRegistrationDTO` |
| POST | `/customer-accounts/create-password?token=...` | `{ password, passwordConfirmation }` |
| POST | `/customer-accounts/resend-activation` | `{ email }` |

Todos os services usam a instância Axios existente. As três rotas públicas de conta de cliente não recebem JWT do armazenamento, inclusive quando há token antigo. Login continua enviando Basic. O tratamento central de erros foi preservado.

### Segunda comparação e validação

| Área | Resultado da revisão final |
|---|---|
| Páginas, rotas e redirecionamentos | Todas as páginas Angular atuais possuem equivalente React; paths e authorities conferidos |
| Clientes e contas públicas | Campos, validações, payloads, mensagens, ações e destinos conferidos com as telas Angular |
| Usuários, perfis e permissões | Funcionalidades anteriores preservadas; guards e proteção de administradores sincronizados |
| Home, perfil e configurações | Mantidos; verificados fluxos de perfil/senha/foto, nome da empresa, ícones e READ/WRITE |
| Services e contratos | Endpoints, verbos, query params, corpos, multipart e blobs comparados novamente |
| Compartilhados | Tabela, filtro, confirmação, mensagens, personalização e Excel reutilizados; tabela ampliada apenas para as capacidades presentes no Angular |
| CSS e assets | Estilos das telas novas adaptados sem redesign; imagens existentes têm hashes iguais às do Angular |
| Dependências | Nenhuma alteração; não há script de lint no `package.json` |

- `npm run build`: TypeScript e build de produção aprovados. Permanece o aviso de tamanho de bundle, já existente.
- `node scripts/sync-smoke.mjs`: testes de navegador com Chrome e API simulada, ampliados para cadastro público, guards, menus, proteção de administradores, CRUD de clientes, fotos, filtros, paginação, seleção entre páginas, exportação, upload/visualização/download/exclusão de anexos e responsividade.
- O mesmo script continua verificando login/JWT, configurações, perfil/senha/foto, permissões, recuperação de senha, erros HTTP e logout.
- `SYNC_SCREENSHOTS=1 node scripts/sync-smoke.mjs` salva capturas opcionais em `node_modules/.sync-screenshots`, sem acrescentar dependências.
- Angular e backends não foram alterados; hashes dos arquivos de origem foram conferidos antes/depois.

### Diferenças técnicas preservadas

React usa estado local, efeitos com cleanup, services async/await e componentes PrimeReact. Não há cópia de módulos/decorators/RxJS; models e DTOs TypeScript mantêm os contratos. CSS recebe prefixos de tela para evitar vazamento global. O ambiente React preexistente e suas variáveis continuam preservados. Home continua sem guard específico e `/catalog` continua sem implementação, assim como na referência. Os testes não enviam e-mails nem gravam dados no backend real.

## Sincronização com Angular - 29/09/2026

Atualização incremental do React existente usando o estado atual de `../locadora_rdt_frontend` (HEAD `03a013c`) como referência funcional. O conteúdo anterior deste documento e as alterações locais anteriores do React foram preservados. Nenhum arquivo Angular ou dos backends foi editado.

### Comparação inicial

A análise cobriu os dois projetos: rotas e guards, autenticação/JWT, autorização, menus, páginas, formulários, validações, models/DTOs, mappers, services, contratos HTTP, componentes compartilhados, exportação, fotos/anexos, CSS e assets. O histórico Git foi usado apenas como apoio; a implementação foi baseada nos arquivos atuais.

As diferenças principais eram os módulos de departamentos, cargos, funcionários e fornecedores ausentes no React; campos de auditoria não mapeados nas listagens existentes; e mudanças recentes na tabela mobile, anexos e sidebar. As funcionalidades já equivalentes de login, conta pública de cliente, ativação, recuperação de senha, perfil, configurações, usuários, clientes e permissões foram mantidas.

### Features adicionadas

- **Departamentos:** listagem paginada, filtro por nome, personalização de campos, exportação Excel, cadastro/edição de nome e descrição, detalhes com auditoria, exclusão individual e de selecionados. A exclusão em lote faz DELETE sequencial, interrompe em caso de erro e recarrega os registros restantes, como no Angular. A seleção é da página atual.
- **Cargos:** listagem, filtro, paginação, colunas personalizadas, Excel, cadastro/edição de nome, detalhes e exclusão individual. O mapper remove espaços nas extremidades do nome; o PUT inclui o ID no corpo. Não foi acrescentada exclusão em lote, inexistente na referência.
- **Funcionários:** listagem, seleção entre páginas, exclusão individual/em lote, ativação/desativação, detalhes, filtro, paginação, personalização e Excel. Formulário com matrícula, contato, endereço, salário em BRL, tipo de contratação, cargo, departamento, admissão, desligamento e foto. Mantidas obrigatoriedades, tamanho mínimo, consulta dos relacionamentos e proibição de desligamento anterior à admissão. Cargo/departamento são enviados como IDs; salário ausente e desligamento vazio são enviados como `null`.
- **Fornecedores:** listagem, filtro, paginação, personalização, Excel, detalhes e exclusão individual. Cadastro/edição com nome, nome fantasia, razão social, e-mail, telefone fixo/celular, CNPJ, endereço e imagem. Preservadas máscaras, obrigatoriedades, nomes dos campos e normalização de e-mail Markdown no mapper. Sem ações de ativação ou exclusão em lote, pois não existem no Angular.
- **Arquivos de funcionários e fornecedores:** modais de listagem/envio, nome do arquivo, preview de imagem, visualização de imagem/PDF, download com nome de `Content-Disposition`, exclusão confirmada e descarte das URLs de objeto. Fotos e imagens são enviadas separadamente do cadastro, com aviso de sucesso parcial quando o upload falha.

Foram adicionadas oito páginas e seis componentes de detalhes/arquivos, seguindo as features React já existentes. Foram reutilizados `DataTable`, `NameFilter`, `FieldCustomization`, `ExcelExport`, `Message`, confirmação, notificações e a instância Axios central. `InputNumber` e `InputTextarea` usam o PrimeReact já instalado.

### Rotas e permissões adicionadas ao React

| Rotas | Authorities |
|---|---|
| `/departments`, `/departments/create`, `/departments/:departmentId/edit` | `DEPARTMENT_READ` para listar; `DEPARTMENT_WRITE` para criar/editar |
| `/positions`, `/positions/create`, `/positions/:positionId/edit` | `POSITION_READ` para listar; `POSITION_WRITE` para criar/editar |
| `/employees`, `/employees/create`, `/employees/:employeeId/edit` | `EMPLOYEE_READ` para listar; `EMPLOYEE_WRITE` para criar/editar |
| `/suppliers`, `/suppliers/create`, `/suppliers/:supplierId/edit` | `SUPPLIER_READ` para listar; `SUPPLIER_WRITE` para criar/editar |

Cada módulo usa também sua authority `*_DELETE` para exclusão; funcionários e fornecedores usam READ/WRITE/DELETE nos anexos. Os novos itens e a condição de visibilidade do grupo Organização seguem o Angular. Nenhuma permissão foi criada ou alterada no backend.

### Services, models e DTOs

- Services: `department.service.ts`, `position.service.ts`, `employee.service.ts`, `employee-file.service.ts`, `supplier.service.ts` e `supplier-file.service.ts`.
- Models: `Department`, `Position`, `Employee`, `EmployeeFile`, `Supplier`, `SupplierFile` e `Address` de fornecedor.
- DTOs de consulta, inserção e atualização das quatro entidades; DTOs de arquivo para funcionário/fornecedor e endereço para fornecedor. Os mappers correspondentes preservam os campos, valores iniciais, datas e contratos da referência.
- Usuários, clientes e perfis: DTOs e mappers de listagem agora preservam auditoria; usuários também preservam `roleIds`. Os tipos/métodos de detalhes existentes no React continuam disponíveis, sem reescrita desnecessária dos consumidores.

### Contratos HTTP acrescentados

| Método | Endpoint | Observação |
|---|---|---|
| GET / POST | `/departments`, `/positions`, `/employees`, `/suppliers` | Paginação e filtro `name`; DTO de inserção específico |
| GET / PUT / DELETE | `/{departments,positions,employees,suppliers}/{id}` | Consulta, atualização e exclusão; departamento recebe ID somente na URL do PUT |
| DELETE | `/employees/all` | Array de IDs no corpo |
| PATCH | `/employees/{id}/active` | Booleano JSON, incluindo `false` |
| GET / PUT | `/employees/{id}/photo` | Blob / multipart com `file` |
| GET / PUT | `/suppliers/{id}/image` | Blob / multipart com `file` |
| GET / POST | `/{employees,suppliers}/{id}/files` | Lista / multipart com `name` e `file` |
| DELETE | `/{employees,suppliers}/{id}/files/{fileId}` | Exclusão do anexo |
| GET | `/{employees,suppliers}/{id}/files/{fileId}/view` | Blob para visualização |
| GET | `/{employees,suppliers}/{id}/files/{fileId}/download` | Blob e cabeçalhos de download |

As novas chamadas usam os mesmos parâmetros de paginação, JWT, tratamento de erros e configuração de ambiente existentes no React. Não houve mudança de URL de ambiente, contrato de API, versão de biblioteca ou instalação de dependência.

### Componentes e comportamento visual atualizados

- Tabela global em telas de até 767px: rótulo acima do valor, alinhamento à esquerda, largura disponível para valores e ações agrupadas à esquerda. A regra é global, sem exceção específica para clientes.
- Arquivos de cliente/funcionário/fornecedor: nome do arquivo em linha própria com margem superior de 8px até 575,98px.
- Navbar com botão hambúrguer a partir de 768px, estado booleano no `MainLayout` e props simples para navbar/sidebar.
- Sidebar desliza em 300ms; navbar e conteúdo acompanham a transição, inclusive ao mudar de breakpoint. O offcanvas do Bootstrap permanece no mobile e a preferência de movimento reduzido é respeitada.
- Estilos dos módulos novos foram adaptados com prefixos de tela/dialog para reproduzir o isolamento do Angular sem afetar outras páginas.
- Assets conferidos por conteúdo: imagens e ícones estáticos continuam iguais aos da referência.

### Segunda comparação e validação

A revisão final voltou a comparar todas as páginas/componentes de feature, campos de models/DTOs, colunas, rotas/authorities, endpoints e verbos HTTP. Não foram encontrados equivalentes faltantes nessas categorias. Também foram reconferidos os formulários, máscaras, payloads, detalhes, anexos, exportação e layout responsivo.

- `npm run build`: TypeScript e build de produção aprovados. Permanece o aviso de tamanho do bundle do Vite; não houve atualização de bibliotecas nem mudança arquitetural para contorná-lo.
- O projeto não possui script de lint configurado.
- `scripts/sync-smoke.mjs` ampliado com Chrome e API simulada: regressão das features existentes e cobertura dos quatro módulos novos, guards, visibilidade das ações, CRUD, auditoria, filtros, exportação, máscaras, salário, relacionamentos, datas, fotos/imagens, anexos, downloads e exclusões.
- Inclui exclusão de funcionários selecionados em páginas diferentes e falha parcial durante exclusão sequencial de departamentos.
- Validação responsiva de tabelas/formulários em 390, 767, 768 e 1024px, alternância da sidebar no desktop/mobile e transições entre breakpoints.
- Capturas opcionais: `SYNC_SCREENSHOTS=1 node scripts/sync-smoke.mjs`, salvas em `node_modules/.sync-screenshots`.
- A integração foi exercitada com respostas simuladas; não foram enviados e-mails nem alterados dados no backend real.
- Conferência de integridade: hashes de 655 arquivos dos projetos de referência e backends permaneceram idênticos antes/depois da atualização.
- O CSS mobile foi validado também pelo alinhamento calculado no navegador, com prioridade suficiente sobre as regras dinâmicas do PrimeReact.

### Diferenças técnicas preservadas

React continua usando estado local, efeitos com cleanup, services async/await e PrimeReact. Classes TypeScript de dados seguem os contratos do Angular sem decorators ou RxJS. Os nomes de DTOs de detalhes já existentes no React foram mantidos onde não havia diferença funcional. A sidebar React continua ajustando a margem do conteúdo porque renderiza o `aside` diretamente, enquanto o Angular reserva largura no elemento do componente; o resultado visual acompanha a referência.


## Sincronização com Angular - 2026-10-02

Atualização incremental usando o estado atual de `locadora_rdt_frontend` (commit `db6936d`) como referência funcional. A base React era o commit `8ed7ba2`. A análise leu os dois projetos e comparou features, componentes, campos, contratos HTTP, guards, permissões, formulários, ações, estilos e assets; o histórico Git foi usado apenas como apoio. Angular e backend permaneceram somente para leitura.

### Diferenças encontradas e implementadas

As features de identidade, organização e configurações do sistema já tinham equivalentes funcionais. Não foram reescritas. Faltavam seis features financeiras completas:

| Feature adicionada | Local no React | Comportamento preservado do Angular |
|---|---|---|
| Contas a pagar | `src/features/financial/payables` | Formulário, cartões, filtros completos, períodos rápidos, paginação, personalização persistida, Excel, detalhes, anexos, baixa total/parcial e encargos de atraso |
| Contas a receber | `src/features/financial/receivables` | Recursos equivalentes de contas, cliente obrigatório, recibo e cupom fiscal para contas pagas, exibição de resíduos e valores históricos |
| Formas de pagamento | `src/features/financial/payment-methods` | CRUD, taxa percentual opcional, seleção entre páginas, exclusão em lote, detalhes, personalização de colunas e Excel |
| Frequências de pagamento | `src/features/financial/payment-frequencies` | CRUD, frequência e dias obrigatórios, zero dias permitido, seleção entre páginas, exclusão em lote, detalhes, colunas e Excel |
| Configurações financeiras | `src/features/settings/financial-settings` | Consulta/atualização dos percentuais de multa e juros; salvar exige WRITE |
| Relatórios financeiros | `src/features/reports/financial-reports` | Sete tipos de relatório, PDF/Excel, filtros condicionais, validações de datas/valores/ano e comparação financeira mensal |

As implementações seguem o React existente: services com async/await e o `httpClient` central, estado local com `useState`/`useEffect`, models/DTOs e mappers explícitos, Bootstrap e PrimeReact. Foram reutilizados `DataTable`, `NameFilter`, `FieldCustomization`, `ExcelExport`, `Message`, confirmações e notificações. O modal de arquivos segue a implementação React de arquivos do cliente. Não foram instaladas dependências, atualizadas versões ou criadas novas configurações HTTP.

### Rotas e permissões adicionadas

| Rotas | Permissão |
|---|---|
| `/payables` | `PAYABLE_READ` |
| `/payables/create`, `/payables/:payableId/edit` | `PAYABLE_WRITE` |
| `/receivables` | `RECEIVABLE_READ` |
| `/receivables/create`, `/receivables/:receivableId/edit` | `RECEIVABLE_WRITE` |
| `/payment-methods` | `METHODS_READ` |
| `/payment-methods/create`, `/payment-methods/:paymentMethodId/edit` | `METHODS_WRITE` |
| `/payment-frequencies` | `FREQUENCY_READ` |
| `/payment-frequencies/create`, `/payment-frequencies/:paymentFrequencyId/edit` | `FREQUENCY_WRITE` |
| `/financial-settings` | `FINANCIAL_SETTINGS_READ`; salvar exige `FINANCIAL_SETTINGS_WRITE` |
| `/reports/financial-reports` | `FINANCIAL_REPORTS_READ` |
| `/reports` | Redireciona para `/reports/financial-reports`, que aplica seu guard |

Exclusões usam `PAYABLE_DELETE`, `RECEIVABLE_DELETE`, `METHODS_DELETE` e `FREQUENCY_DELETE`. Os anexos usam READ para listar/visualizar/baixar, WRITE para enviar e DELETE para excluir. Editar e baixar contas exige WRITE e a conta deve estar aberta e não cancelada. Nenhuma authority foi criada ou alterada no backend.

### Services, models, DTOs, mappers e componentes

- Services adicionados: `payable.service.ts`, `payable-file.service.ts`, `receivable.service.ts`, `receivable-file.service.ts`, `payment-method.service.ts`, `payment-frequency.service.ts`, `financial-setting.service.ts` e `financial-report.service.ts`.
- Models adicionados: `Payable`, `PayableFile`, `PayableFilters`, `Receivable`, `ReceivableFile`, `ReceivableFilters`, `PaymentMethod`, `PaymentFrequency`, `FinancialSetting`, `FinancialReport`, `FinancialReportFilter`, `FinancialReportMonth` e a interface `FinancialReportOption`.
- DTOs das contas: consulta, inserção, atualização, baixa, resumo e arquivos, mantendo todos os campos específicos do contrato atual. Formas/frequências possuem DTOs de consulta/inserção/atualização; configurações possuem consulta/atualização; relatórios possuem dados, filtros e meses.
- Mappers correspondentes em `mappers`, conforme a organização já usada pelo React.
- Páginas de listagem/formulário das quatro entidades, formulário de configurações e página de relatórios. Contas incluem componentes de filtros, períodos rápidos, detalhes, arquivos, atraso, escolha/edição de encargos e baixa. Formas/frequências incluem detalhes.
- CSS adaptado com escopo de tela/dialog, mantendo classes, medidas, cores, ícones e breakpoints do Angular. Não houve redesign nem necessidade de novos assets.

### Contratos HTTP preservados

| Métodos | Endpoints | Contrato |
|---|---|---|
| GET / POST | `/payables`, `/receivables` | Paginação, busca, status, período, vínculos, forma/frequência e limites de valor; DTO de inserção específico |
| GET / PUT / DELETE | `/{payables,receivables}/{id}` | Consulta, atualização e exclusão |
| POST | `/{payables,receivables}/{id}/payments` | Valor da baixa, data, forma, subtotal, taxa, juros e multa |
| GET | `/{payables,receivables}/report` | Resumo e parâmetros legados `description`, `status`, `dateType` e datas |
| GET | `/receivables/{id}/receipt`, `/receivables/{id}/fiscal-coupon` | PDF como Blob |
| GET / POST | `/{payables,receivables}/{id}/files` | Lista de arquivos / multipart com `name` e `file` |
| DELETE | `/{payables,receivables}/{id}/files/{fileId}` | Exclusão do anexo |
| GET | `/{payables,receivables}/{id}/files/{fileId}/{view,download}` | Blob; download preserva o nome recebido nos cabeçalhos |
| GET / POST | `/payment-methods`, `/payment-frequencies` | Paginação e filtro por `name` ou `frequency` |
| GET / PUT / DELETE | `/{payment-methods,payment-frequencies}/{id}` | Consulta, atualização e exclusão |
| DELETE | `/{payment-methods,payment-frequencies}/all` | Array de IDs no corpo |
| GET / PUT | `/financial-settings` | Percentuais de multa e juros |
| GET | `/reports/financial-reports/{reportType}/{pdf,xlsx}` | Blob e filtros do relatório |
| GET | `/reports/financial-reports/comparison` | Totais, saldo, contagens, ano e meses |

A baixa inicia o valor a pagar/receber no valor atual, calculado com o saldo em aberto mais taxa da forma de pagamento, multa e juros aplicáveis. A troca da forma recalcula a taxa e o total. O valor pode ser reduzido para uma baixa parcial, mas não pode ser zero nem ultrapassar o total. O `subtotal` enviado continua representando o valor da conta, conforme o Angular. Para contas pagas, o valor pago/recebido exibido corresponde ao valor atual. Não existe criação de parcelamentos nem desconto automático de PIX/boleto; campos históricos de desconto e vínculo com conta anterior continuam disponíveis para consulta, conforme a referência.

### Arquivos existentes atualizados

- `src/app/App.tsx`: rotas novas e guards existentes.
- `src/core/config/api.config.ts`: somente os grupos financeiros ausentes.
- `src/shared/components/sidebar/Sidebar.tsx`: grupos Financeiro/Relatórios e visibilidade de Organização também para POSITION_READ/SUPPLIER_READ.
- `src/shared/components/sidebar/Sidebar.css`: aparência e rolagem do menu atual do Angular, preservando o offcanvas e a transição responsiva.
- `scripts/sync-smoke.mjs`: API simulada e verificações financeiras, preservando a regressão anterior.
- Este documento: seção acrescentada, sem apagar o histórico.

Foram adicionados 108 arquivos nas seis features. Nenhum arquivo existente foi removido. As demais features e os componentes compartilhados existentes foram preservados.

### Particularidades entre Angular e React

O menu de Relatórios no Angular atual é visível por USER_READ/ROLE_READ, enquanto a página exige FINANCIAL_REPORTS_READ. Essa regra de visibilidade foi preservada, sem inventar uma nova regra de autorização. A permissão da rota segue FINANCIAL_REPORTS_READ. No React, o submenu recebeu um ID próprio (`submenuReportsDesktop`), pois o Angular repete o ID de Administração; isso permite alternar os grupos independentemente.

Diferenças de nomes/organização já existentes continuam válidas: `role.dto.ts` representa `RoleDTO`; recuperação de senha usa `requestReset`/`reset` e os formulários já normalizam os valores; atualização do nome/ícone do sistema fica em `SessionContext`. Os contratos e comportamentos dessas features continuam equivalentes, portanto não foram reescritos.

### Segunda comparação e validação

A segunda análise conferiu novamente todos os componentes das features, campos de models/DTOs, mappers, services, parâmetros HTTP, rotas, permissões, formulários, cartões/tabelas, ações, filtros, paginação, modais, uploads/downloads, exportações, CSS e assets. O inventário verificou 62 componentes de feature, 24 services de feature, 92 classes de models/DTOs e 80 entradas da configuração de API. Após considerar os equivalentes funcionais já existentes, não restaram páginas, services, campos ou endpoints ausentes nas categorias revisadas.

- `npm run build`: TypeScript e produção aprovados. O aviso de tamanho do bundle já existia na base; não foram alteradas dependências ou arquitetura para contorná-lo.
- Não há comando de lint configurado no `package.json`.
- `node scripts/sync-smoke.mjs`: regressão anterior e novos fluxos financeiros aprovados com Chrome e API local simulada.
- Verificações novas: guards, menus, visibilidade por permissões, CRUD, filtros/ordenação, zero nos parâmetros numéricos, períodos rápidos, paginação, preferências antigas de campos, Excel, seleção entre páginas e exclusão em lote.
- Baixa total/parcial e com atraso: payloads, limites de valor, taxa calculada sobre o saldo, troca de forma, encargos padrão/editados, ausência de descontos automáticos e valor pago/recebido igual ao atual nas contas pagas.
- Arquivos: multipart, visualização PDF, download com nome UTF-8, exclusão, permissões e aviso de falha parcial no envio após salvar a conta.
- Relatórios: filtros condicionais, gráfico mensal, PDF/Excel, sínteses, balanço anual, validações de datas/valores/ano e liberação dos controles após erro HTTP. Recibo e cupom fiscal usam os endpoints originais.
- Responsividade validada em 390, 576, 767, 768 e 1024 pixels, incluindo formulários, listagens, relatórios e modal de arquivos, sem transbordamento horizontal.
- Capturas opcionais: `SYNC_SCREENSHOTS=1 node scripts/sync-smoke.mjs`, em `node_modules/.sync-screenshots`.
- Hashes de 459 arquivos do Angular e 329 do backend permaneceram idênticos. Nenhum desses projetos foi alterado.
- Limitação: os fluxos foram exercitados com respostas simuladas; não houve validação contra uma instância real do backend, alteração de dados reais ou conferência do conteúdo gerado pelo servidor nos PDFs/planilhas.

## Sincronização com Angular - 2026-10-07

### Comparação e escopo

Foi realizada uma comparação inicial dos dois projetos antes de alterar arquivos, considerando funcionalidades, formulários, rotas/guards, permissões, services, DTOs/models, mappers, componentes compartilhados, configuração HTTP, estilos e assets. O histórico Angular foi utilizado como apoio até `0dd5662`, incluindo as alterações locais ainda não commitadas de Relatórios de Estoque. A referência é o conteúdo atual do Angular, inclusive esses arquivos locais.

Identidade, organização, financeiro e configurações já possuíam equivalentes React. As diferenças estavam em Contato, cinco features de estoque, Relatórios de Estoque e a autorização do menu de relatórios. A migração existente foi preservada. Não houve atualização de dependências, mudança de arquitetura, nova instância HTTP, alteração de contratos ou redesign.

### Features e componentes adicionados

| Feature | Implementação | Comportamento |
|---|---|---|
| Contato | `src/features/contact/pages` | Conteúdo, telefone, horários, layout e responsividade da referência; autenticação obrigatória, sem authority específica |
| Categorias | `src/features/stocks/categories` | Cadastro/edição, validações, listagem, imagens, detalhes, atividade, seleção entre páginas, exclusão individual/em lote, colunas e Excel |
| Itens | `src/features/stocks/items` | Cadastro/edição, nome/descrição/categoria, preço opcional ou zero, imagens, detalhes, atividade, seleção entre páginas, exclusão, colunas, Excel e acesso às unidades |
| Unidades físicas | `src/features/stocks/item-units` | Cadastro/edição, conservação, compra e observações; detalhes, situação com motivo, baixa definitiva e reentrada, seleção, colunas e Excel |
| Saldos | `src/features/stocks/stock-balances` | Contagens e alerta calculados no backend, mínimo inteiro não negativo, filtro, paginação, unidades por item, colunas e Excel |
| Movimentações | `src/features/stocks/stock-movements` | Histórico e registro de entrada, saída definitiva, ajuste e alteração de situação; paginação, busca, colunas, Excel e situações traduzidas |
| Relatórios de Estoque | `src/features/reports/stock-reports` | Saldos, abaixo do mínimo, unidades e movimentações; filtros condicionais, resumo/gráfico, PDF e Excel |

Foram adicionados 14 componentes/páginas, incluindo os modais de detalhes de categoria, item e unidade. As tabelas, filtros, confirmação, personalização, exportação, mensagens e notificações reutilizam os componentes React existentes. Os estilos mantêm os valores e breakpoints do Angular, com escopo de tela ou dialog para preservar as demais features.

### Rotas e permissões

| Rotas | Proteção |
|---|---|
| `/contact` | JWT válido; nenhuma authority específica |
| `/categories` | `CATEGORY_READ` |
| `/categories/create`, `/categories/:categoryId/edit` | `CATEGORY_WRITE` |
| `/items` | `ITEM_READ` |
| `/items/create`, `/items/:itemId/edit` | `ITEM_WRITE` |
| `/item-units` | `ITEM_UNIT_READ` |
| `/item-units/create`, `/item-units/:itemUnitId/edit` | `ITEM_UNIT_WRITE` |
| `/stock-balances` | `STOCK_BALANCES_READ` |
| `/stock-balances/:itemId/units` | `STOCK_BALANCES_READ` e `ITEM_UNIT_READ` |
| `/stock-balances/:itemId/units/create`, `/stock-balances/:itemId/units/:itemUnitId/edit` | `STOCK_BALANCES_READ` e `ITEM_UNIT_WRITE` |
| `/stock-movements` | `STOCK_MOVEMENTS_READ` |
| `/stock-movements/create` | `STOCK_MOVEMENTS_WRITE` |
| `/reports/stock-reports` | `STOCK_REPORTS_READ` |

As ações de exclusão usam `CATEGORY_DELETE`, `ITEM_DELETE` e `ITEM_UNIT_DELETE`. Alteração de atividade/imagem usa WRITE da entidade; situação e reentrada usam `ITEM_UNIT_WRITE`; edição do mínimo usa `STOCK_BALANCES_WRITE`. A baixa não é permitida para unidades já inativas. Reentrada exige item e categoria ativos. A escolha de unidade em uma movimentação exige `ITEM_UNIT_READ`; saída automática permanece disponível sem essa permissão.

O grupo Relatórios agora é visível por `FINANCIAL_REPORTS_READ` ou `STOCK_REPORTS_READ`, e cada link verifica sua própria permissão, conforme o Angular atual. Essa regra substitui a observação histórica da sincronização anterior sobre USER_READ/ROLE_READ nesse grupo. Contato e Estoque foram acrescentados ao menu, mantendo o comportamento responsivo existente.

### Services, dados e contratos

Foram adicionados seis services: `category.service.ts`, `item.service.ts`, `item-unit.service.ts`, `stock-balance.service.ts`, `stock-movement.service.ts` e `stock-report.service.ts`. Todos utilizam `httpClient`, JWT, notificações e tratamento HTTP já existentes. Requisições canceladas deixam de ser tratadas como erro de serviço no interceptor, permitindo cancelar a busca anterior de unidades.

Models adicionados: `Category`, `Item`, `ItemUnit`, `StockBalance`, `StockMovement`, `StockReport`, `StockReportFilter` e `StockReportOption`. Os 17 DTOs preservam os contratos de consulta, inserção, atualização, situação, mínimo, resumo, filtros e opções; seis mappers fazem a conversão explícita. O arquivo `item-unit-options.ts` mantém situações e conservação em listas separadas, com os mesmos rótulos do Angular.

| Métodos | Endpoints |
|---|---|
| GET/POST | `/inventory/categories`, `/inventory/items`, `/inventory/item-units` |
| GET/PUT/DELETE | `/inventory/{categories,items,item-units}/{id}` |
| DELETE | `/inventory/{categories,items,item-units}/all`, com array de IDs no corpo |
| PATCH | `/inventory/{categories,items,item-units}/{id}/active`, com boolean JSON |
| GET/PUT | `/inventory/{categories,items}/{id}/image`, com Blob ou multipart `file` |
| PATCH | `/inventory/item-units/{id}/status`, com `status` e `reason` |
| PATCH | `/inventory/item-units/{id}/maintenance`, contrato auxiliar preservado |
| GET | `/inventory/stock-balances`, `/{id}` e `/item/{itemId}` |
| PATCH | `/inventory/stock-balances/{id}/minimum`, somente `minimumQuantity` no corpo |
| GET/POST | `/inventory/stock-movements` |
| GET | `/reports/stock-reports/options`, `/summary` e `/{reportType}/{pdf,xlsx}` |

### Regras relevantes preservadas

- Unidades iniciam no filtro Ativas e oferecem Com baixa/Todas. Listagem e exportação enviam o mesmo `active` opcional, inclusive `false`. Alterar o filtro limpa seleção e reinicia paginação; baixa e reentrada recarregam a lista.
- Cadastro/edição de unidade envia somente `itemId`, `conditionStatus`, `purchaseDate` e `notes`; edição também envia `id`. Situação e código patrimonial não são enviados nesses formulários. O código gerado no backend aparece nas consultas e no histórico; não foi adicionado número de série.
- A situação operacional é separada da conservação. Unidades AVAILABLE com item/categoria inativos aparecem indisponíveis; outras situações físicas continuam visíveis. Unidades com baixa aparecem inativas.
- Ajuste representa o total ativo desejado e aceita zero. Saída específica exige unidade disponível e quantidade 1. Alteração de situação exige unidade ativa, quantidade 1 e situação diferente. Entrada/saída exige item e categoria ativos. Motivo aceita até 255 caracteres.
- Trocar item/tipo limpa unidade e situação. A consulta anterior de unidades é cancelada; selects percorrem todas as páginas. Selecionar uma unidade fixa a quantidade em 1.
- Contagens/alerta vêm do backend. O mínimo só aceita inteiro não negativo e volta ao valor do servidor após erro/valor inválido. No React, o valor digitado é confirmado ao sair do campo.
- Relatórios carregam opções no endpoint próprio, sem exigir leitura de categorias/itens. Trocar categoria limpa item; trocar relatório limpa filtros ocultos; Com baixa limpa/desabilita situação. Resumo usa somente categoria/item. Período invertido é rejeitado. PDF abre em aba com fallback para download.
- Upload de imagem ocorre após salvar a entidade. Falha parcial produz o aviso da referência e retorna à lista. A imagem ausente não impede o carregamento das categorias no formulário de item. URLs de prévia são liberadas.

### Segunda comparação e validação

A revisão final comparou novamente todas as features, contratos, fields, DTOs/models, mappers, services, rotas, guards, authorities, ações, filtros, paginação, modais, validações, exportação, upload, download, estilos e assets. O inventário dos dois projetos possui 76 componentes de feature correspondentes, 52 authorities e 102 templates de URL. Não foram identificados models/DTOs, referências de endpoints de services ou rotas declaradas sem equivalente. Os assets existentes são idênticos e não foi necessário acrescentar imagens.

- `npm run build`: TypeScript e build de produção; permanece somente o aviso de tamanho do bundle.
- O `package.json` não possui comando de lint.
- `node scripts/sync-smoke.mjs`: regressão de identidade, organização, financeiro e novos fluxos de estoque com Chrome e API local simulada.
- `scripts/stocks-smoke.mjs`: verificações adicionais de guards, permissões combinadas, menus, ações READ, CRUD, imagens multipart, preço ausente/zero, DTOs mínimos de unidades, baixa/reentrada/situação, filtro active, mínimo, ajuste zero, seleção entre páginas, PDF/Excel e erro HTTP.
- Consulta de 1.001 unidades e troca do item confirmam paginação dos selects e ausência de seleção anterior. Saída automática é testada sem leitura de unidades.
- As novas telas foram verificadas em 390, 576, 767, 768 e 1024 pixels, sem transbordamento horizontal. Capturas de telas desktop/mobile também foram inspecionadas.
- Execução apenas das verificações de estoque: `SYNC_STOCKS_ONLY=1 node scripts/sync-smoke.mjs`. Capturas opcionais: `SYNC_SCREENSHOTS=1`, em `node_modules/.sync-screenshots`.
- Angular e os dois backends foram conferidos por hashes de arquivos antes e depois; somente o projeto React foi alterado.

Os testes usam respostas simuladas. Não foi validada uma instância real do backend nem o conteúdo real dos PDFs/planilhas gerados pelo servidor. Permanecem as diferenças naturais de JSX/estado React, Promises em lugar de Observable e escopo explícito de CSS; os contratos e as regras da referência foram mantidos.
