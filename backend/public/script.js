const STORAGE_KEY = 'todo_categorias_v1';
let categorias = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const nomeCategoriaEl = document.getElementById('nomeCategoria');
const categoriaSelectEl = document.getElementById('categoriaSelect');
const tarefaNomeEl = document.getElementById('tarefaNome');
const prioridadeEl = document.getElementById('prioridade');
const dataFimEl = document.getElementById('dataFim');
const listaCategoriasEl = document.getElementById('listaCategorias');

document.getElementById('btnCriarCategoria').addEventListener('click', criarCategoria);
document.getElementById('btnAdicionar').addEventListener('click', adicionarTarefa);

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
}

function criarCategoria() {
  const nome = nomeCategoriaEl.value.trim();
  if (!nome) return alert('Digite um nome!');
  categorias.push({ nome, tarefas: [] });
  nomeCategoriaEl.value = '';
  salvar();
  atualizarCategorias();
}

function atualizarCategorias() {
  listaCategoriasEl.innerHTML = '';
  categoriaSelectEl.innerHTML = '';

  categorias.forEach((cat, index) => {
    // Select
    const opt = document.createElement('option');
    opt.value = index; 
    opt.textContent = cat.nome;
    categoriaSelectEl.appendChild(opt);

    // Bloco visual
    const bloco = document.createElement('div');
    bloco.className = 'categoria';

    const titulo = document.createElement('h3');
    titulo.innerHTML = `📁 ${cat.nome}`;

    const botoesCat = document.createElement('div');
    botoesCat.style.display = "flex";
    botoesCat.style.gap = "6px";

    const btnEditCat = document.createElement('button');
    btnEditCat.className = "btn-edit";
    btnEditCat.textContent = "✏️ Editar";
    btnEditCat.onclick = () => editarCategoria(index);

    const btnDeleteCat = document.createElement('button');
    btnDeleteCat.className = "btn-danger";
    btnDeleteCat.textContent = "🗑️ Excluir";
    btnDeleteCat.onclick = () => removerCategoria(index);

    botoesCat.appendChild(btnEditCat);
    botoesCat.appendChild(btnDeleteCat);

    const topRow = document.createElement('div');
    topRow.style.display = "flex";
    topRow.style.justifyContent = "space-between";
    topRow.appendChild(titulo);
    topRow.appendChild(botoesCat);

    bloco.appendChild(topRow);

    if (!cat.tarefas.length) {
      const p = document.createElement('p');
      p.textContent = "Nenhuma tarefa ainda.";
      bloco.appendChild(p);
    }

    cat.tarefas.forEach((tarefa, i) => {
      const item = document.createElement('div');
      item.className = 'tarefa' + (tarefa.concluida ? ' concluida' : '');

      const left = document.createElement('div');

      const strong = document.createElement('strong');
      strong.textContent = tarefa.nome;

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        Prioridade: ${iconPrioridade(tarefa.prioridade)}
        &nbsp;|&nbsp; Início: ${formatDate(tarefa.dataInicio)}
        &nbsp;|&nbsp; Fim: ${formatDate(tarefa.dataFim)}
      `;

      left.appendChild(strong);
      left.appendChild(meta);

      const right = document.createElement('div');
      right.style.display = "flex";
      right.style.gap = "6px";

      const btnConcluir = document.createElement('button');
      btnConcluir.className = "btn-ok";
      btnConcluir.textContent = tarefa.concluida ? "↩️ Reabrir" : "✔️ Concluir";
      btnConcluir.onclick = () => toggleConcluir(index, i);

      const btnEditar = document.createElement('button');
      btnEditar.className = "btn-edit";
      btnEditar.textContent = "✏️";
      btnEditar.onclick = () => editarTarefa(index, i);

      const btnExcluir = document.createElement('button');
      btnExcluir.className = "btn-danger";
      btnExcluir.textContent = "🗑️";
      btnExcluir.onclick = () => removerTarefa(index, i);

      right.appendChild(btnConcluir);
      right.appendChild(btnEditar);
      right.appendChild(btnExcluir);

      item.appendChild(left);
      item.appendChild(right);
      bloco.appendChild(item);
    });

    listaCategoriasEl.appendChild(bloco);
  });
}

function iconPrioridade(p) {
  return p === "Alta" ? "🔥 Alta" :
         p === "Média" ? "⚠️ Média" : 
         "💧 Baixa";
}

function adicionarTarefa() {
  const catIndex = categoriaSelectEl.value;
  if (catIndex === '') return alert("Selecione uma categoria");

  const nome = tarefaNomeEl.value.trim();
  const prioridade = prioridadeEl.value;
  const dataInicio = new Date().toISOString().split("T")[0];
  const dataFim = dataFimEl.value || "Indefinida";

  if (!nome) return alert("Digite uma tarefa!");

  categorias[catIndex].tarefas.push({
    nome, prioridade, dataInicio, dataFim, concluida: false
  });

  tarefaNomeEl.value = "";
  dataFimEl.value = "";
  salvar();
  atualizarCategorias();
}

function toggleConcluir(cat, t) {
  categorias[cat].tarefas[t].concluida = 
    !categorias[cat].tarefas[t].concluida;
  salvar();
  atualizarCategorias();
}

function editarTarefa(cat, t) {
  const tarefa = categorias[cat].tarefas[t];

  let novaDesc = prompt("Descrição:", tarefa.nome);
  if (novaDesc === null) return;
  novaDesc = novaDesc.trim() || tarefa.nome;

  let novaPrio = prompt("Prioridade (Baixa, Média, Alta):", tarefa.prioridade);
  if (novaPrio === null) novaPrio = tarefa.prioridade;

  let novoFim = prompt("Nova data fim (AAAA-MM-DD):", tarefa.dataFim);
  if (novoFim === null) novoFim = tarefa.dataFim;

  tarefa.nome = novaDesc;
  tarefa.prioridade = novaPrio;
  tarefa.dataFim = novoFim || "Indefinida";

  salvar();
  atualizarCategorias();
}

function removerTarefa(cat, t) {
  if (!confirm("Excluir tarefa?")) return;
  categorias[cat].tarefas.splice(t,1);
  salvar();
  atualizarCategorias();
}

function editarCategoria(i) {
  let novoNome = prompt("Novo nome:", categorias[i].nome);
  if (novoNome && novoNome.trim()) {
    categorias[i].nome = novoNome.trim();
    salvar();
    atualizarCategorias();
  }
}

function removerCategoria(i) {
  if (!confirm("Excluir categoria e todas as tarefas?")) return;
  categorias.splice(i,1);
  salvar();
  atualizarCategorias();
}

function formatDate(v) {
  if (!v || v === "Indefinida") return "Indefinida";
  const p = v.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

atualizarCategorias();
