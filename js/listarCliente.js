import { db } from "./firebaseConfig.js";
import { getDocs, collection, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js"

async function buscarCliente() {
    const dadosBanco = await getDocs(collection(db, "cliente"))
    const funcionarios = []
    for (const doc of dadosBanco.docs) {
        funcionarios.push({ id: doc.id, ...doc.data() })
    }
    return funcionarios;
}

const listaFuncionarioDiv = document.getElementById("listar-funcionario")

async function carregarListaDeFuncionario() {
    listaFuncionarioDiv.innerHTML = "<p> Carregando Lista de Funcionários...</p>"
    try {
        const funcionarios = await buscarFuncionarios();
        console.log(funcionarios)
        renderizarListaDeFuncionarios(funcionarios);
    } catch (error) {
        console.log("Erro ao carregar a lista de funcionário: ", error);
        listaFuncionarioDiv.innerHTML = "<p> Erro ao carregar a lista de Funcionários </p>"
    }

}

function renderizarListaDeFuncionarios(funcionarios) {
    listaFuncionarioDiv.innerHTML = " "

    if (funcionarios.length === 0) {
        listaFuncionarioDiv.innerHTML = "<p> Nenhum funcionário encontrado :( </p>"
        return
    }

    for (let funcionario of funcionarios) {
        const funcionariosDiv = document.createElement("div");
        funcionariosDiv.classList.add("funcionario-item");
        funcionariosDiv.innerHTML = `
        <strong> Nome: </strong> ${funcionario.nome} <br>
        <strong> Idade: </strong> ${funcionario.idade} <br>
        <strong> Cargo: </strong> ${funcionario.cargo} <br>
        <button class="btn-excluir" data-id="${funcionario.id}"> Excluir </button> <br>
        <button class="btn-editar" data-id="${funcionario.id}"> Editar </button> 
        `
        listaFuncionarioDiv.appendChild(funcionariosDiv)
    }
    addEventListener();
}

    async function excluirFuncionario(idFuncionario) {
        try {
            const documentoDeletar = doc(db, "funcionarios", idFuncionario);
            await deleteDoc(documentoDeletar);
            console.log("Funcionário excluído com sucesso");
            return true;
        } catch (erro) {
            console.error("Erro ao excluir funcionário: ", erro);
            alert("Erro ao excluir funcionário. Tente novamente!");
            return false;
        }
    }

async function lidarClique(eventoDeClique) {
    const btnExcluir = eventoDeClique.target.closest('.btn-excluir');
    if (btnExcluir) {
        const certeza = confirm("Tem certeza que deseja excluir este funcionário?");
        if (certeza) {
            const idFuncionario = btnExcluir.dataset.id;
            const exclusaoBemSucedida = await excluirFuncionario(idFuncionario);
            if (exclusaoBemSucedida) {
                carregarListaDeFuncionario();
                alert("Funcionário excluído com sucesso!");
            } else {
                alert("Exclusão cancelada.");
            }
        }
    }
    const btnEditar = eventoDeClique.target.closest('.btn-editar');
    if (btnEditar) {
        const idFuncionario = btnEditar.dataset.id;
        const funcionario = await buscarFuncionarioPorId(idFuncionario);

        const edicao = getValoresEditar();

        edicao.editarNome.value=funcionario.nome.value;
        edicao.editarIdade.value=funcionario.idade;
        edicao.editarCargo.value=funcionario.cargo;
        edicao.idFuncionario.value=idFuncionario;

        edicao.formularioEditar.style.display="block";
    }
}

    function getValoresEditar() {
        return {
            editarNome: document.getElementById("editar-nome"),
            editarIdade: document.getElementById("editar-idade"),
            editarCargo: document.getElementById("editar-cargo"),
            idFuncionario: document.getElementById("id-funcionario"),
    }
}

async function buscarFuncionarioPorId(id) {
    try{
        const funcionarioDoc = doc(db, "funcionarios", id);
        const dadoAtual = await getDoc(funcionarioDoc);

        if(dadoAtual.exists()){
            return {id: dadoAtual.id, ...dadoAtual.data()};
        } else {
            console.log("Nenhum funcionário encontrado com esse ID", id);
            return null;
        }
    } catch (erro) {
        console.log("Erro ao buscar funcionário por ID: ", erro);
        alert("Erro ao buscar funcionário para editar");
        return null;
    }
}

document.getElementById("btnSalvarEdicao").addEventListener("click", async() => {
     const id = edicao.editarId.value;
     const novoDados = {
        nome: edicao.editarNome.value.trim(),
        idade: parseInt(edicao.editarIdade.value),
        cargo: edicao.editarCargo.value.trim()
     };

     try {
        const ref = doc(db, "funcionarios", id);
        await setDoc(ref, novoDados);
        alert("Funcionário atualizado com sucesso!");
        edicao.formularioEditar.style.display="none";
        carregarListaDeFuncionario();
     } catch (erro) {
        console.log("Erro ao atualizar funcionário: ", erro);
        alert("Erro ao atualizar funcionário. Tente novamente!");
     }
})

document.getElementById("btnCancelarEdicao").addEventListener("click", () => {
    document.getElementById("formulario-edicao").style.display="none";
})

function addEventListener() {
    listaFuncionarioDiv.addEventListener("click", lidarClique);
}

document.addEventListener("DOMContentLoaded", carrega);