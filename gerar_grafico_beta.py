import matplotlib.pyplot as plt
import csv
import itertools
import math
import os

# Função para ler dados do CSV
def ler_dados_csv(nome_arquivo):
    resultados = []
    with open(nome_arquivo, 'r') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)  # Pular o cabeçalho
        for row in csv_reader:
            resultados.append({
                'metodo': row[0],
                'k': int(row[1]),
                'm': int(row[2]),
                'j': int(row[3]),
                'beta': float(row[4]) if row[4] != 'NaN' else float('nan')
            })
    return resultados

# Função para criar gráfico
def criar_grafico(resultados, metodo):
    plt.figure(figsize=(12, 6))
    
    # Filtrar resultados para o método atual e K fixo
    resultados_metodo = [r for r in resultados if r['k'] == K_FIXO]
    
    # Obter valores únicos de j
    j_valores = sorted(set(r['j'] for r in resultados_metodo))
    
    min_beta = float('inf')
    max_beta = 0
    
    for j, cor, estilo in zip(j_valores, itertools.cycle(cores), itertools.cycle(estilos_linha)):
        # Filtrar resultados para o j atual
        dados_j = [r for r in resultados_metodo if r['j'] == j]
        
        # Ordenar por m
        dados_j.sort(key=lambda x: x['m'])
        
        # Extrair m e beta
        m = [d['m'] for d in dados_j]
        beta = [d['beta'] for d in dados_j]
        
        # Atualizar os valores mínimo e máximo de beta
        valid_betas = [b for b in beta if not math.isnan(b) and b > 0]
        if valid_betas:
            min_beta = min(min_beta, min(valid_betas))
            max_beta = max(max_beta, max(valid_betas))
        
        # Plotar a linha para este j
        plt.plot(m, beta, color=cor, linestyle=estilo, label=f'Fase {j}', marker='o')

    # Configurar o gráfico
    plt.ylabel('Fator de Crescimento (β)')
    plt.xlabel('Tamanho da Memória (m)')
    
    # Usar escala logarítmica para o eixo Y
    plt.yscale('log')
    
    # Ajustar os limites do eixo Y
    if min_beta > 0 and max_beta > 0:
        plt.ylim(min_beta / 1.1, max_beta * 1.1)
    
    # Usar o nome completo do algoritmo no título
    nome_completo = nomes_algoritmos[metodo]
    plt.title(f'Comportamento de β(m,j) para ordenação {nome_completo}, k = {K_FIXO}')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()

    # Salvar o gráfico como uma imagem
    plt.savefig(f'grafico_beta_{metodo}_k{K_FIXO}.png', dpi=300, bbox_inches='tight')
    print(f"Gráfico salvo como 'grafico_beta_{metodo}_k{K_FIXO}.png'")

# Definir cores e estilos de linha para cada j
cores = ['#4bc0c0', '#ff6384', '#ffcd56', '#36a2eb', '#9966ff']
estilos_linha = ['-', '--', '-.', ':', '-']

# Valor fixo de K para todos os gráficos
K_FIXO = 4

# Lista de métodos
metodos = ['B', 'P', 'C']

# Dicionário com os nomes completos dos algoritmos
nomes_algoritmos = {
    'B': 'Balanceada Multi-caminhos',
    'P': 'Polifásica',
    'C': 'Cascata'
}

# Processar cada método separadamente
for metodo in metodos:
    nome_arquivo = f'resultados_experimento_beta_{metodo}.csv'
    if os.path.exists(nome_arquivo):
        resultados = ler_dados_csv(nome_arquivo)
        criar_grafico(resultados, metodo)
    else:
        print(f"Arquivo {nome_arquivo} não encontrado. Pulando...")

# Mostrar todos os gráficos (opcional)
# plt.show()