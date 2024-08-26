# projeto-mata-54

Este projeto implementa algoritmos de ordenação externa: Balanceada Multi-caminhos, Polifásica e Cascata.

## Pré-requisitos

Este projeto utiliza o [Bun](https://bun.sh), um runtime JavaScript rápido e all-in-one.

### Instalando o Bun

Para instalar o Bun, execute o seguinte comando no seu terminal:

```bash
curl https://bun.sh/install | sh
```

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/projeto-mata-54.git
   cd projeto-mata-54
   ```

2. Instale as dependências:
   ```bash
   bun install
   ```

## Executando o projeto

Para rodar o projeto, use o seguinte comando:

```bash
bun run src/index.ts
```

Este comando executará o arquivo principal do projeto, que contém exemplos de uso dos algoritmos de ordenação externa.

## Executando testes

Para rodar os testes unitários, execute:

```bash
bun test
```

## Executando com arquivo de entrada

Você também pode fornecer um arquivo de entrada como argumento de linha de comando:

```bash
bun run src/index.ts '/caminho/para/seu/arquivo.txt'
```

O arquivo de entrada deve seguir o formato especificado:

```
B
3 4 3
7 1 5 6 3 8 2 10 4 9 1 3 7 4 1 2 3
```

## Implementação dos algoritmos

As implementações dos algoritmos de ordenação externa estão localizadas nos seguintes arquivos:

* `src/balancedMultiwaySort.ts`: Implementação do algoritmo de ordenação balanceada multi-caminhos.
* `src/polyphaseSort.ts`: Implementação do algoritmo de ordenação polifásica.
* `src/cascadeSort.ts`: Implementação do algoritmo de ordenação cascata.