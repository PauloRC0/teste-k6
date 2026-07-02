```markdown
# Atividade Prática: Descobrindo o Limite de uma API com k6

Este repositório contém uma atividade prática complementar criada para testar o desempenho, carga e estresse de uma API local utilizando o **k6**. O objetivo é descobrir, na prática, até quantos usuários simultâneos (`vus`) a API aguenta antes de deixar de cumprir um requisito de desempenho — subindo a carga, rodada por rodada, até o teste falhar.

## 🚀 Sobre a API

A API foi desenvolvida em **Node.js + Express + better-sqlite3** e roda localmente. 
* O endpoint testado é o `/report`, que realiza uma agregação pesada (`GROUP BY`, `COUNT`, `AVG`, `SUM`) em 10.000 registros — pesado o bastante para ter um limite real e alcançável em segundos.
* **Ponto-chave (Causa raiz):** O `better-sqlite3` é síncrono, o que significa que cada consulta bloqueia o *event loop* do Node enquanto executa. Sob carga concorrente, as requisições enfileiram em vez de rodar em paralelo, gerando a degradação progressiva e o limite que serão encontrados.

---

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* [k6](https://k6.io/docs/get-started/installation/) instalado globalmente no seu sistema operacional.
* Experiência prévia em testes manuais de APIs com Postman.

---

## 💻 Como Executar o Projeto Localmente

Siga os passos abaixo para clonar o repositório, preparar o ambiente e rodar os testes.

### 1. Clonar o Repositório
Abra o seu terminal e execute:
```bash
git clone [https://github.com/SEU-USUARIO/TESTE-K6.git](https://github.com/SEU-USUARIO/TESTE-K6.git)
cd TESTE-K6

```

*(Substitua a URL acima com o link real do seu repositório do GitHub)*

### 2. Instalar as Dependências e Popular o Banco

Instale os pacotes do Node e gere os dados fictícios para o banco SQLite:

```bash
# Instala as dependências e popula o banco de dados com 10.000 produtos (pule se o database.db já existir)
npm install
node seed.js

```

### 3. Iniciar o Servidor da API

Inicie a aplicação local:

```bash
npm start

```

Aguarde a mensagem **"API iniciada"** aparecer no terminal do servidor antes de rodar qualquer teste. Ela estará rodando em `http://localhost:3001`.

> ⚠️ **Importante:** Mantenha este terminal aberto e rodando durante todo o teste. Abra um **segundo terminal** para executar os comandos do k6.

---

## 📊 Executando os Testes de Carga com k6

O script de teste está localizado em `teste/report-breakpoint-test.js` e possui regras rígidas (*thresholds*) de sucesso:

* `http_req_duration`: 95% das requisições devem responder em menos de 500ms (`p(95)<500`).
* `http_req_failed`: Zero falhas de requisição (`rate==0`).
* `checks`: 100% das checagens devem passar (`rate==1.0`).

Se algum critério quebrar, a falha aparecerá claramente na tela com um `✗`.

### Passo a Passo: Subindo a carga até quebrar

Rode as rodadas sequencialmente. Para cada rodada, abra o arquivo `teste/report-breakpoint-test.js`, altere o valor do `target` nas duas linhas de *stages*, salve o arquivo e execute o comando correspondente no terminal:

```javascript
export const options = {
    stages: [
        { duration: '5s', target: 150 },  // Altere aqui o valor do target
        { duration: '25s', target: 150 }, // E altere aqui também
    ],
    // ... restante do script
};

```

| Rodada | Altere o `target` para | Comando para executar |
| --- | --- | --- |
| **1** | `150` | `k6 run teste/report-breakpoint-test.js` |
| **2** | `300` | `k6 run teste/report-breakpoint-test.js` |
| **3** | `450` | `k6 run teste/report-breakpoint-test.js` |
| **4** | `600` | `k6 run teste/report-breakpoint-test.js` |

> 💡 **Nota:** Não é necessário reiniciar a API entre as rodadas — apenas espere uma terminar antes de começar a próxima.

### 📝 O que analisar e anotar em cada rodada?

1. Os thresholds ficaram `✓` (verde) ou `✗` (vermelho)?
2. Qual threshold quebrou primeiro: `http_req_duration`, `http_req_failed` ou `checks`?
3. Qual foi o `p(95)` de `http_req_duration` exibido na saída do terminal?

**Pare assim que encontrar a primeira rodada com `✗**`. Esse é o intervalo onde está o limite da API.

---

## 💡 Por que a carga sobe em rampa (*stages*) e não com VUs fixos?

Se todos os VUs fossem abertos no mesmo instante, o sistema operacional poderia recusar parte das conexões por causa de uma rajada abrupta de tentativas simultâneas. Isso geraria erros de *connection refused* que não têm relação com a API, mas que podem ser confundidos com "ela quebrou". A rampa de 5s evita esse ruído e garante que qualquer falha encontrada seja da capacidade real da API.

---

## 🏁 Análise Final

Ao finalizar os testes, você deve conseguir responder:

1. Em qual faixa de VUs a API começou a falhar?
2. O `http_req_duration` (p95) subiu de forma gradual entre as rodadas ou "explodiu" de uma hora para outra?
3. O número foi parecido em comparação com computadores de configurações diferentes?

```

```
