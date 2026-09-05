# Gestão de Patrimônio Imobiliário — Mobile

App mobile (Android + iOS) com as mesmas funcionalidades do
[`gestao-patrimonio-frontend`](../gestao-patrimonio-frontend), consumindo a API
REST [`gestao-patrimonio-imobiliario`](../gestao-patrimonio-imobiliario).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Expo SDK 57 + React Native 0.86 |
| Navegação | Expo Router (file-based, abas + stack) |
| Linguagem | TypeScript |
| Dados / cache | TanStack Query |
| Formulários | React Hook Form + Zod |
| Gráfico | react-native-svg (hand-rolled) |
| Componentes | próprios (StyleSheet + tema) |
| Datas | @react-native-community/datetimepicker |
| Seletores | @react-native-picker/picker |
| Persistência local | @react-native-async-storage/async-storage |

## Funcionalidades (paridade com o web)

- **Painel** (aba inicial): totais de patrimônio, aluguéis (mês/ano), resultado
  (% aluguel anual ÷ patrimônio) e recebido acumulado; gráfico de evolução dos
  aluguéis (12 meses); lista de alertas; lista de imóveis. Seletor de usuário no
  topo (persistido).
- **Imóveis, Inquilinos, Contratos, Usuários**: busca, cadastro, edição e
  exclusão. Botão flutuante "+" para novo registro.
- **Endereço + CEP**: nos formulários de imóvel e inquilino, ao digitar o CEP o
  endereço é buscado (`GET /api/enderecos/cep/{cep}`, provedor ViaCEP no backend)
  e os campos são preenchidos automaticamente.
- **Exclusão com vínculo**: imóvel/inquilino ligado a contrato exibe
  "Não é possível excluir…" e bloqueia a ação.
- Pull-to-refresh em todas as listas e no painel.

## Como rodar

```bash
npm install
npm start          # abre o Expo Dev Server (QR code)
npm run android    # abre no emulador/dispositivo Android
npm run ios        # abre no simulador iOS (requer macOS)
```

Use o app **Expo Go** para rodar em um aparelho físico sem build nativo.

## Endereço da API

O app precisa alcançar o backend Spring Boot (porta 8080). O valor padrão está
em `app.json` → `expo.extra.apiBaseUrl` (`http://10.0.2.2:8080`, que no emulador
Android aponta para o `localhost` da máquina).

Ajuste em tempo de execução na tela **Ajustes** (ícone de engrenagem no Painel):

| Ambiente | Endereço |
| --- | --- |
| Emulador Android | `http://10.0.2.2:8080` |
| Simulador iOS | `http://localhost:8080` |
| Aparelho físico | `http://SEU_IP_LOCAL:8080` (mesma rede Wi-Fi) |

Também é possível fixar via variável de ambiente antes do bundling:
`EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8080 npm start`.

O backend libera CORS/segurança para todas as origens em desenvolvimento, então
o app chama a API diretamente (sem proxy).

## Estrutura

```
app/                       # rotas (Expo Router)
  _layout.tsx              # Stack + providers
  (tabs)/                  # abas: index (Painel), imoveis, inquilinos, contratos, usuarios
  imoveis|inquilinos|contratos|usuarios/  # novo.tsx e [id].tsx
  ajustes.tsx              # endereço da API
src/
  lib/       types, dashboard, vinculos, format, labels, theme, config, toast, api/
  hooks/     use-{usuarios,imoveis,inquilinos,contratos}.ts (TanStack Query)
  providers/ query, selected-user, toast
  components/ ui/, forms/, dashboard/, EntityRow, UserSwitcher, Fab, ConfirmDelete
```

`src/lib/{types,dashboard,vinculos}.ts` são compartilhados 1:1 com o projeto web.
