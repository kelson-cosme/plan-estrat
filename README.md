# Sistema de Gestão de Manutenção Industrial

Este é um sistema completo para gestão de manutenção industrial, desenvolvido para otimizar o controle e monitoramento de equipamentos, planos de manutenção e ordens de serviço. A aplicação oferece uma interface intuitiva para gerenciar todo o ciclo de manutenção, desde o planejamento até a execução e análise de relatórios.

## ✨ Funcionalidades Principais

* **Dashboard Interativo:** Visualização rápida dos principais KPIs (Indicadores Chave de Desempenho), como status dos equipamentos, ordens de serviço e alertas críticos.
* **Gestão de Equipamentos:** Cadastro e controle de todos os ativos da planta, com informações detalhadas, status e criticidade. Oferece visualização em card e em lista.
* **Planos de Manutenção:** Crie e gerencie planos de manutenção preventiva, preditiva e corretiva, definindo tarefas, frequência e recursos necessários.
* **Ordens de Serviço (OS):** Geração de ordens de serviço a partir de planos, agendamentos ou de forma avulsa. Acompanhe todo o ciclo de vida da OS, desde a abertura até a conclusão.
* **Calendário e Mapa Anual:** Visualize todas as manutenções programadas em um calendário interativo e planeje paradas estratégicas com o mapa anual de 52 semanas.
* **Agendamentos Automáticos:** Sistema de agendamento que gera ordens de serviço automaticamente com base na frequência dos planos de manutenção.
* **Relatórios e Análises:** Gráficos e tabelas para análise de desempenho, custos, tipos de manutenção e principais falhas.
* **Autenticação e Perfis:** Sistema de login seguro com perfis de usuário para controle de acesso.
* **Impressão de OS:** Gere uma versão para impressão das ordens de serviço, ideal para uso em campo.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com tecnologias modernas para garantir uma experiência de usuário fluida e um desenvolvimento eficiente:

* **Frontend:**
    * [React](https://react.dev/)
    * [Vite](https://vitejs.dev/)
    * [TypeScript](https://www.typescriptlang.org/)
    * [Tailwind CSS](https://tailwindcss.com/) para estilização.
    * **shadcn/ui:** Biblioteca de componentes para a interface, incluindo:
        * Tabelas, Cards, Botões, Inputs, Selects, etc.
* **Backend & Banco de Dados:**
    * [Supabase](https://supabase.com/) como plataforma de backend (Autenticação, Banco de Dados PostgreSQL).
* **Gerenciamento de Estado e Dados:**
    * [TanStack Query (React Query)](https://tanstack.com/query/v5) para fetching e cache de dados do servidor.
    * React Context API para gerenciamento de estado global (autenticação e modo de visualização).
* **Roteamento:**
    * [React Router DOM](https://reactrouter.com/) para navegação entre as páginas.
* **Linting e Formatação:**
    * ESLint e TypeScript-ESLint para garantir a qualidade do código.

## 🔧 Como Iniciar o Projeto Localmente

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)
* Uma conta no [Supabase](https://supabase.com/) para configurar o banco de dados.

### Instalação

1.  **Clone o repositório:**
    ```sh
    git clone [https://github.com/seu-usuario/plan-estrat.git](https://github.com/seu-usuario/plan-estrat.git)
    cd plan-estrat
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    ```

### Configuração do Supabase

1.  Crie um novo projeto no seu painel do Supabase.
2.  Navegue até **SQL Editor** e execute o script de migração para criar as tabelas necessárias. Você pode encontrar o script em `supabase/migrations/20250610112701-9bbd5ed3-44a2-4cf2-9ab1-66474a7d0751.sql`.
3.  Vá para **Project Settings > API**.
4.  Copie a **URL do Projeto** e a **Chave Pública (anon key)**.
5.  Renomeie o arquivo `.env.example` para `.env` (se existir) ou crie um novo.
6.  Adicione as suas credenciais do Supabase ao arquivo `src/integrations/supabase/client.ts`, substituindo as chaves existentes:

    ```typescript
    // src/integrations/supabase/client.ts
    import { createClient } from '@supabase/supabase-js';
    import type { Database } from './types';

    const SUPABASE_URL = "SUA_URL_SUPABASE";
    const SUPABASE_PUBLISHABLE_KEY = "SUA_CHAVE_PUBLICA_ANON";

    export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    

### Executando o Projeto

Com as dependências instaladas e o ambiente configurado, inicie o servidor de desenvolvimento:

```sh

npm run dev

Abra http://localhost:8080 (ou a porta indicada no seu terminal) para ver a aplicação em funcionamento.

```

## 📁 Estrutura do Projeto
A estrutura de pastas do projeto está organizada da seguinte forma:

```sh
/
├── public/                # Arquivos estáticos
├── src/
│   ├── components/        # Componentes reutilizáveis da aplicação
│   │   └── ui/            # Componentes base do shadcn/ui
│   ├── contexts/          # Contextos React (Auth, ViewMode)
│   ├── hooks/             # Hooks customizados
│   ├── integrations/      # Integração com serviços (Supabase)
│   ├── lib/               # Funções utilitárias
│   ├── pages/             # Componentes de página (rotas)
│   ├── App.tsx            # Componente principal da aplicação
│   ├── main.tsx           # Ponto de entrada da aplicação
│   └── index.css          # Estilos globais com Tailwind
├── supabase/
│   └── migrations/        # Migrações do banco de dados
├── package.json           # Dependências e scripts do projeto
└── README.md              # Este arquivo
L e SUPABASE_PUBLISHABLE_KEY) nas configurações do projeto na Vercel.
```
