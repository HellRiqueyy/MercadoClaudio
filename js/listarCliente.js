import { db } from "./firebaseConfig.js";
import { getDocs, collection, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

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
        <p> Nome: ${cliente.nome} </p>
        <p> Telefone: ${cliente.telfone} </p>
        <p> Valor: ${cliente.valor} </p>
        <p> Juros: ${cliente.juros}% </p>
        <p> Data: ${cliente.data} </p>
        <button class="btn-excluir" data-id="${cliente.id}"> Excluir </button> <br>
        <button class="btn-editar" data-id="${cliente.id}"> Editar </button> 
        `
        listaClienteDiv.appendChild(clientesDiv)
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
    const btnExcluir = eventoDeClique.target.closest('.btn-excluir');
    if (btnExcluir) {
        const certeza = confirm("Tem certeza que deseja excluir este cliente?");
        if (certeza) {
            const idCliente = btnExcluir.dataset.id;
            const exclusaoBemSucedida = await excluirCliente(idCliente);
            if (exclusaoBemSucedida) {
                carregarListaDeCliente();
                alert("Cliente excluído com sucesso!");
            } else {
                alert("Exclusão cancelada.");
            }
        }
    }
    const btnEditar = eventoDeClique.target.closest('.btn-editar');
    if (btnEditar) {
        const idCliente = btnEditar.dataset.id;
        const cliente = await buscarClientePorId(idCliente);

        const edicao = getValoresEditar();

        edicao.editarNome.value=cliente.nome.value;
        edicao.editarTelefone.value=cliente.telfone;
        edicao.editarValor.value=cliente.valor;
        edicao.editarJuros.value=cliente.juros;
        edicao.editarData.value=cliente.data;

        edicao.formularioEditar.style.display="block";
    }
}

    function getValoresEditar() {
        return {
            editarNome: document.getElementById("editar-nome"),
            editarTelefone: document.getElementById("editar-telefone"),
            editarValor: document.getElementById("editar-valor"),
            editarJuros: document.getElementById("editar-juros"),
            editarData: document.getElementById("editar-data"),
    }
}

async function buscarClientePorId(id) {
    try{
        const funcionarioDoc = doc(db, "cliente", id);
        const dadoAtual = await getDoc(funcionarioDoc);

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