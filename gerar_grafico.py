import matplotlib.pyplot as plt
import csv

# Ler os dados do arquivo CSV
pares_ordenados = []

with open('resultados_experimento.csv', 'r') as file:
    csv_reader = csv.reader(file)
    next(csv_reader)  # Pular o cabeçalho
    for row in csv_reader:
        pares_ordenados.append((int(row[0]), float(row[1])))

# Ordenar os pares ordenados
pares_ordenados.sort(key=lambda x: x[0])

# Separar os valores ordenados em listas x e y
x = [par[0] for par in pares_ordenados]
y = [par[1] for par in pares_ordenados]

# Criar o gráfico
plt.figure(figsize=(12, 6))
plt.plot(x, y, color='#4bc0c0')

# Configurar os eixos
plt.ylabel('Taxa de Processamento (α)')
plt.xlabel('Número de Sequências Iniciais (r)')
plt.ylim(0, 2)
plt.xlim(0, max(x))

# Adicionar título
plt.title('Comportamento de α(r) para ordenação balanceada multi-caminhos')

# Adicionar grade
plt.grid(True, linestyle='--', alpha=0.7)

# Salvar o gráfico como uma imagem
plt.savefig('grafico_alpha_balanceada.png', dpi=300, bbox_inches='tight')
print("Gráfico salvo como 'grafico_alpha_balanceada.png'")

# Mostrar o gráfico (opcional)
# plt.show()