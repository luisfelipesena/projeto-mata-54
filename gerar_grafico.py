import matplotlib.pyplot as plt
import csv
import itertools

# Ler os dados do arquivo CSV
resultados = []

with open('resultados_experimento.csv', 'r') as file:
    csv_reader = csv.reader(file)
    next(csv_reader)  # Pular o cabeçalho
    for row in csv_reader:
        resultados.append({
            'metodo': row[0],
            'k': int(row[1]),
            'r': int(row[2]),
            'alpha': float(row[3])
        })

# Definir cores e estilos de linha para cada k
cores = ['#4bc0c0', '#ff6384', '#ffcd56', '#36a2eb']
estilos_linha = ['-', '--', '-.', ':']

# Criar um gráfico para cada método
metodos = set(resultado['metodo'] for resultado in resultados)

for metodo in metodos:
    plt.figure(figsize=(12, 6))
    
    # Filtrar resultados para o método atual
    resultados_metodo = [r for r in resultados if r['metodo'] == metodo]
    
    # Obter valores únicos de k
    k_valores = sorted(set(r['k'] for r in resultados_metodo))
    
    for k, cor, estilo in zip(k_valores, cores, estilos_linha):
        # Filtrar resultados para o k atual
        dados_k = [r for r in resultados_metodo if r['k'] == k]
        
        # Ordenar por r
        dados_k.sort(key=lambda x: x['r'])
        
        # Extrair r e alpha
        r = [d['r'] for d in dados_k]
        alpha = [d['alpha'] for d in dados_k]
        
        # Plotar a linha para este k
        plt.plot(r, alpha, color=cor, linestyle=estilo, label=f'k = {k}')

    # Configurar o gráfico
    plt.ylabel('Taxa de Processamento (α)')
    plt.xlabel('Número de Sequências Iniciais (r)')
    plt.ylim(0, 2)
    plt.xlim(0, max(r))
    plt.title(f'Comportamento de α(r) para ordenação {metodo}')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()

    # Salvar o gráfico como uma imagem
    plt.savefig(f'grafico_alpha_{metodo}.png', dpi=300, bbox_inches='tight')
    print(f"Gráfico salvo como 'grafico_alpha_{metodo}.png'")

# Mostrar todos os gráficos (opcional)
# plt.show()