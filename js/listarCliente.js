import { db } from "./firebaseConfig.js";
import { getDocs, collection, doc, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

async function buscarCliente() {
    const dadosBanco = await getDocs(collection(db, "cliente"))
    const clientes = []
    for (const doc of dadosBanco.docs) {
        clientes.push({ id: doc.id, ...doc.data() })
    }
    return clientes;
}

const listaClienteDiv = document.getElementById("listaClienteDiv")

async function carregarListaDeCliente() {
    listaClienteDiv.innerHTML = "<p> Carregando clientes...</p>"
    try {
        const clientes = await buscarCliente();
        console.log(clientes)
        renderizarListaDeCliente(clientes);
    } catch (error) {
        console.log("Erro ao carregar a lista de cliente: ", error);
        listaClienteDiv.innerHTML = "<p> Erro ao carregar a lista de cliente </p>"
    }

}

function calcularValorComJuros(cliente) {
    const now = new Date();
    const start = new Date(cliente.data);
    const days = (now - start) / (1000 * 60 * 60 * 24);
    if (days < 30) {
        return cliente.valor;
    } else {
        const months = Math.floor(days / 30);
        return cliente.valor * (1 + (cliente.juros / 100) * months);
    }
}

function renderizarListaDeCliente(clientes) {
    listaClienteDiv.innerHTML = " "

    if (clientes.length === 0) {
        listaClienteDiv.innerHTML = "<p> Nenhum cliente encontrado :( </p>"
        return
    }

    for (let cliente of clientes) {
        const clientesDiv = document.createElement("div");
        clientesDiv.classList.add("cliente-item");
        clientesDiv.innerHTML = `
        <p> Nome: ${cliente.nome || ""} </p>
        <p> Telefone: ${cliente.telefone || ""} </p>
        <p> Valor: ${calcularValorComJuros(cliente).toFixed(2)} </p>
        <p> Juros: ${cliente.juros || ""}% </p>
        <p> Data: ${cliente.data} </p>
        <button class="btn-pagar" data-id="${cliente.id}"> Pagar </button> <br>
        <button class="btn-editar" data-id="${cliente.id}"> Editar </button> 
        `
        listaClienteDiv.appendChild(clientesDiv)
    }

    if (!document.getElementById("modal-pagar")) {
        const modalPagar = document.createElement("div");
        modalPagar.id = "modal-pagar";
        modalPagar.style.display = "none";
        modalPagar.innerHTML = `
            <h3>Pagar para cliente: <span id="cliente-nome"></span></h3>
            <input type="number" id="valor-pagar" placeholder="Valor a pagar" min="0" step="0.01">
            <button id="confirmar-pagar">Confirmar</button>
            <button id="cancelar-pagar">Cancelar</button>
        `;
        listaClienteDiv.appendChild(modalPagar);

        document.getElementById('confirmar-pagar').addEventListener('click', async () => {
            const idCliente = document.getElementById('modal-pagar').dataset.idCliente;
            const valorPagar = parseFloat(document.getElementById('valor-pagar').value);
            if (isNaN(valorPagar)) {
                alert('Valor inválido');
                return;
            }
            const cliente = await buscarClientePorId(idCliente);
            const displayValor = calcularValorComJuros(cliente);
            const novoValor = displayValor - valorPagar;
            if (novoValor < 0) {
                alert('Valor a pagar é maior que o valor devido');
                return;
            }
            await updateDoc(doc(db, "cliente", idCliente), { valor: novoValor });
            const clienteDiv = document.querySelector(`.cliente-item button[data-id="${idCliente}"]`).parentElement;
            if (novoValor === 0) {
                await excluirCliente(idCliente);
                clienteDiv.remove();
                alert('Pagamento realizado com sucesso e cliente removido');
            } else {
                const valorP = clienteDiv.querySelector('p:nth-child(3)');
                valorP.textContent = `Valor: ${novoValor.toFixed(2)}`;
                alert('Pagamento realizado com sucesso');
            }
            document.getElementById('modal-pagar').style.display = 'none';
        });

        document.getElementById('cancelar-pagar').addEventListener('click', () => {
            document.getElementById('modal-pagar').style.display = 'none';
        });
    }

    if (!document.getElementById("modal-editar")) {
        const modalEditar = document.createElement("div");
        modalEditar.id = "modal-editar";
        modalEditar.style.display = "none";
        modalEditar.innerHTML = `
            <h3>Editar cliente</h3>
            <input type="text" id="editar-nome" placeholder="Nome">
            <input type="text" id="editar-telefone" placeholder="Telefone">
            <input type="text" id="editar-juros" placeholder="Juros">
            <input type="date" id="editar-data">
            <button id="confirmar-editar">Confirmar</button>
            <button id="cancelar-editar">Cancelar</button>
        `;
        listaClienteDiv.appendChild(modalEditar);

        document.getElementById('confirmar-editar').addEventListener('click', async () => {
            const idCliente = document.getElementById('modal-editar').dataset.idCliente;
            const novoNome = document.getElementById('editar-nome').value;
            const novoTelefone = document.getElementById('editar-telefone').value;
            const novoJuros = document.getElementById('editar-juros').value;
            const novaData = document.getElementById('editar-data').value;
            await updateDoc(doc(db, "cliente", idCliente), { nome: novoNome, telefone: novoTelefone, juros: novoJuros, data: novaData });
            const clienteDiv = document.querySelector(`.cliente-item button[data-id="${idCliente}"]`).parentElement;
            clienteDiv.querySelector('p:nth-child(1)').textContent = `Nome: ${novoNome}`;
            clienteDiv.querySelector('p:nth-child(2)').textContent = `Telefone: ${novoTelefone}`;
            clienteDiv.querySelector('p:nth-child(4)').textContent = `Juros: ${novoJuros}%`;
            clienteDiv.querySelector('p:nth-child(5)').textContent = `Data: ${novaData}`;
            alert('Cliente editado com sucesso');
            document.getElementById('modal-editar').style.display = 'none';
        });

        document.getElementById('cancelar-editar').addEventListener('click', () => {
            document.getElementById('modal-editar').style.display = 'none';
        });
    }

    addEventListener();
}

    async function excluirCliente(idCliente) {
        try {
            const documentoDeletar = doc(db, "cliente", idCliente);
            await deleteDoc(documentoDeletar);
            console.log("Cliente excluído com sucesso");
            return true;
        } catch (erro) {
            console.error("Erro ao excluir cliente: ", erro);
            alert("Erro ao excluir cliente. Tente novamente!");
            return false;
        }
    }

async function lidarClique(eventoDeClique) {
    const btnPagar = eventoDeClique.target.closest('.btn-pagar');
    if (btnPagar) {
        const idCliente = btnPagar.dataset.id;
        const cliente = await buscarClientePorId(idCliente);
        document.getElementById('cliente-nome').textContent = cliente.nome;
        document.getElementById('modal-pagar').style.display = 'block';
        document.getElementById('modal-pagar').dataset.idCliente = idCliente;
    }
    const btnEditar = eventoDeClique.target.closest('.btn-editar');
    if (btnEditar) {
        const idCliente = btnEditar.dataset.id;
        const cliente = await buscarClientePorId(idCliente);
        document.getElementById('editar-nome').value = cliente.nome || "";
        document.getElementById('editar-telefone').value = cliente.telefone || "";
        document.getElementById('editar-juros').value = cliente.juros || "";
        document.getElementById('editar-data').value = cliente.data || "";
        document.getElementById('modal-editar').dataset.idCliente = idCliente;
        document.getElementById('modal-editar').style.display = 'block';
    }
}

async function buscarClientePorId(id) {
    try{
        const ClienteDoc = doc(db, "cliente", id);
        const dadoAtual = await getDoc(ClienteDoc);

        if(dadoAtual.exists()){
            return {id: dadoAtual.id, ...dadoAtual.data()};
        } else {
            console.log("Nenhum cliente encontrado com esse ID", id);
            return null;
        }
    } catch (erro) {
        console.log("Erro ao buscar cliente por ID: ", erro);
        alert("Erro ao buscar cliente para editar");
        return null;
    }
}


function addEventListener() {
    listaClienteDiv.addEventListener("click", lidarClique);
}

document.addEventListener("DOMContentLoaded", carregarListaDeCliente);