import { db } from "./firebaseConfig.js";
import { getDocs, collection, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

async function buscarCliente() {
    const dadosBanco = await getDocs(collection(db, "cliente"))
    const cliente = []
    for (const doc of dadosBanco.docs) {
        cliente.push({ id: doc.id, ...doc.data() })
    }
    return cliente;
}

const listaClienteDiv = document.getElementById("listaClienteDiv")

async function carregarListaDeCliente() {
    listaClienteDiv.innerHTML = "<p> Carregando clientes...</p>"
    try {
        const cliente = await buscarCliente();
        console.log(cliente)
        renderizarListaDeCliente(cliente);
    } catch (error) {
        console.log("Erro ao carregar a lista de cliente: ", error);
        listaClienteDiv.innerHTML = "<p> Erro ao carregar a lista de cliente </p>"
    }

}

function renderizarListaDeCliente(cliente) {
    listaClienteDiv.innerHTML = " "

    if (cliente.length === 0) {
        listaClienteDiv.innerHTML = "<p> Nenhum cliente encontrado :( </p>"
        return
    }

    for (let cliente of cliente) {
        const clienteDiv = document.createElement("div");
        clienteDiv.classList.add("cliente-item");
        clienteDiv.innerHTML = `
        <p> Nome: ${cliente.nome} <p>
        <p> Telefone: ${cliente.telfone} <p>
        <p> Valor: ${cliente.valor} <p>
        <p> Juros: ${cliente.juros} <p>
        <button class="btn-excluir" data-id="${cliente.id}"> Excluir </button> <br>
        <button class="btn-editar" data-id="${cliente.id}"> Editar </button> 
        `
        listaClienteDiv.appendChild(clienteDiv)
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

document.getElementById("btnSalvarEdicao").addEventListener("click", async() => {
     const id = edicao.editarId.value;
     const novoDados = {
        nome: edicao.editarNome.value.trim(),
        telefone: edicao.editarTelefone.value.trim(),
        valor: parseInt(edicao.editarValor.value),
        juros: parseInt(edicao.editarJuros.value),
        data: edicao.editarData.value.trim()
     };

     try {
        const ref = doc(db, "cliente", id);
        await setDoc(ref, novoDados);
        alert("Cliente atualizado com sucesso!");
        edicao.formularioEditar.style.display="none";
        carregarListaDeFuncionario();
     } catch (erro) {
        console.log("Erro ao atualizar cliente: ", erro);
        alert("Erro ao atualizar cliente. Tente novamente!");
     }
})

document.getElementById("btnCancelarEdicao").addEventListener("click", () => {
    document.getElementById("formulario-edicao").style.display="none";
})

function addEventListener() {
    listaClienteDiv.addEventListener("click", lidarClique);
}

document.addEventListener("DOMContentLoaded", carregarListaDeCliente);