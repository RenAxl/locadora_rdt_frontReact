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
