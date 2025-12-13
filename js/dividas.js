import { db } from "./firebaseConfig.js";
import { getDocs, collection, doc, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

async function buscarDivida() {
    const dadosBanco = await getDocs(collection(db, "divida"))
    const dividas = []
    for (const doc of dadosBanco.docs) {
        dividas.push({ id: doc.id, ...doc.data() })
    }
    return dividas;
}

const listaDividaDiv = document.getElementById("listaDividaDiv")

async function carregarListaDeDivida() {
    listaDividaDiv.innerHTML = "<p> Carregando dividas...</p>"
    try {
        const dividas = await buscarDivida();
        console.log(dividas)
        renderizarListaDeDivida(dividas);
    } catch (error) {
        console.log("Erro ao carregar a lista de divida: ", error);
        listaDividaDiv.innerHTML = "<p> Erro ao carregar a lista de divida </p>"
    }

}

function calcularValorComJuros(divida) {
    const now = new Date();
    const start = new Date(divida.data);
    const days = (now - start) / (1000 * 60 * 60 * 24);
    if (days < 30) {
        return divida.valor;
    } else {
        const months = Math.floor(days / 30);
        return divida.valor * (1 + (divida.juros / 100) * months);
    }
}

function renderizarListaDeDivida(dividas) {
    listaDividaDiv.innerHTML = " "

    if (dividas.length === 0) {
        listaDividaDiv.innerHTML = "<p> Nenhuma divida encontrada :( </p>"
        return
    }

    for (let divida of dividas) {
        const dividasDiv = document.createElement("div");
        dividasDiv.classList.add("divida-item");
        dividasDiv.innerHTML = `
        <p> Nome: ${divida.nome || ""} </p>
        <p> Telefone: ${divida.telefone || ""} </p>
        <p> Valor: ${calcularValorComJuros(divida).toFixed(2)} </p>
        <p> Juros: ${divida.juros || ""}% </p>
        <p> Data: ${divida.data} </p>
        <button class="btn-pagar-divida" data-id="${divida.id}"> Pagar </button> <br>
        <button class="btn-editar-divida" data-id="${divida.id}"> Editar </button> 
        `
        listaDividaDiv.appendChild(dividasDiv)
    }

    if (!document.getElementById("modal-pagar-dividas")) {
        const modalPagar = document.createElement("div");
        modalPagar.id = "modal-pagar-dividas";
        modalPagar.style.display = "none";
        modalPagar.innerHTML = `
            <h3>Pagar para divida: <span id="divida-nome"></span></h3>
            <input type="number" id="valor-pagar-dividas" placeholder="Valor a pagar" min="0" step="0.01">
            <button id="confirmar-pagar-dividas">Confirmar</button>
            <button id="cancelar-pagar-dividas">Cancelar</button>
        `;
        listaDividaDiv.appendChild(modalPagar);

        document.getElementById('confirmar-pagar-dividas').addEventListener('click', async () => {
            const idDivida = document.getElementById('modal-pagar-dividas').dataset.idDivida;
            const valorPagar = parseFloat(document.getElementById('valor-pagar-dividas').value);
            if (isNaN(valorPagar)) {
                alert('Valor inválido');
                return;
            }
            const divida = await buscarDividaPorId(idDivida);
            const displayValor = calcularValorComJuros(divida);
            const novoValor = displayValor - valorPagar;
            if (novoValor < 0) {
                alert('Valor a pagar é maior que o valor devido');
                return;
            }
            await updateDoc(doc(db, "divida", idDivida), { valor: novoValor });
            const dividaDiv = document.querySelector(`.divida-item button[data-id="${idDivida}"]`).parentElement;
            if (novoValor === 0) {
                await excluirDivida(idDivida);
                dividaDiv.remove();
                alert('Pagamento realizado com sucesso e divida removida');
            } else {
                const valorP = dividaDiv.querySelector('p:nth-child(3)');
                valorP.textContent = `Valor: ${novoValor.toFixed(2)}`;
                alert('Pagamento realizado com sucesso');
            }
            document.getElementById('modal-pagar-dividas').style.display = 'none';
        });

        document.getElementById('cancelar-pagar-dividas').addEventListener('click', () => {
            document.getElementById('modal-pagar-dividas').style.display = 'none';
        });
    }

    if (!document.getElementById("modal-editar-dividas")) {
        const modalEditar = document.createElement("div");
        modalEditar.id = "modal-editar-dividas";
        modalEditar.style.display = "none";
        modalEditar.innerHTML = `
            <h3>Editar divida</h3>
            <input type="text" id="editar-nome-dividas" placeholder="Nome">
            <input type="text" id="editar-telefone-dividas" placeholder="Telefone">
            <input type="text" id="editar-juros-dividas" placeholder="Juros">
            <input type="date" id="editar-data-dividas">
            <button id="confirmar-editar-dividas">Confirmar</button>
            <button id="cancelar-editar-dividas">Cancelar</button>
        `;
        listaDividaDiv.appendChild(modalEditar);

        document.getElementById('confirmar-editar-dividas').addEventListener('click', async () => {
            const idDivida = document.getElementById('modal-editar-dividas').dataset.idDivida;
            const novoNome = document.getElementById('editar-nome-dividas').value;
            const novoTelefone = document.getElementById('editar-telefone-dividas').value;
            const novoJuros = document.getElementById('editar-juros-dividas').value;
            const novaData = document.getElementById('editar-data-dividas').value;
            await updateDoc(doc(db, "divida", idDivida), { nome: novoNome, telefone: novoTelefone, juros: novoJuros, data: novaData });
            const dividaDiv = document.querySelector(`.divida-item button[data-id="${idDivida}"]`).parentElement;
            dividaDiv.querySelector('p:nth-child(1)').textContent = `Nome: ${novoNome}`;
            dividaDiv.querySelector('p:nth-child(2)').textContent = `Telefone: ${novoTelefone}`;
            dividaDiv.querySelector('p:nth-child(4)').textContent = `Juros: ${novoJuros}%`;
            dividaDiv.querySelector('p:nth-child(5)').textContent = `Data: ${novaData}`;
            alert('Divida editada com sucesso');
            document.getElementById('modal-editar-dividas').style.display = 'none';
        });

        document.getElementById('cancelar-editar-dividas').addEventListener('click', () => {
            document.getElementById('modal-editar-dividas').style.display = 'none';
        });
    }

    addEventListener();
}

    async function excluirDivida(idDivida) {
        try {
            const documentoDeletar = doc(db, "divida", idDivida);
            await deleteDoc(documentoDeletar);
            console.log("Divida excluída com sucesso");
            return true;
        } catch (erro) {
            console.error("Erro ao excluir divida: ", erro);
            alert("Erro ao excluir divida. Tente novamente!");
            return false;
        }
    }

async function lidarClique(eventoDeClique) {
    const btnPagar = eventoDeClique.target.closest('.btn-pagar-divida');
    if (btnPagar) {
        const idDivida = btnPagar.dataset.id;
        const divida = await buscarDividaPorId(idDivida);
        document.getElementById('divida-nome').textContent = divida.nome;
        document.getElementById('modal-pagar-dividas').style.display = 'block';
        document.getElementById('modal-pagar-dividas').dataset.idDivida = idDivida;
    }
    const btnEditar = eventoDeClique.target.closest('.btn-editar-divida');
    if (btnEditar) {
        const idDivida = btnEditar.dataset.id;
        const divida = await buscarDividaPorId(idDivida);
        document.getElementById('editar-nome-dividas').value = divida.nome || "";
        document.getElementById('editar-telefone-dividas').value = divida.telefone || "";
        document.getElementById('editar-juros-dividas').value = divida.juros || "";
        document.getElementById('editar-data-dividas').value = divida.data || "";
        document.getElementById('modal-editar-dividas').dataset.idDivida = idDivida;
        document.getElementById('modal-editar-dividas').style.display = 'block';
    }
}

async function buscarDividaPorId(id) {
    try{
        const DividaDoc = doc(db, "divida", id);
        const dadoAtual = await getDoc(DividaDoc);

        if(dadoAtual.exists()){
            return {id: dadoAtual.id, ...dadoAtual.data()};
        } else {
            console.log("Nenhuma divida encontrada com esse ID", id);
            return null;
        }
    } catch (erro) {
        console.log("Erro ao buscar divida por ID: ", erro);
        alert("Erro ao buscar divida para editar");
        return null;
    }
}


function addEventListener() {
    listaDividaDiv.addEventListener("click", lidarClique);
}

document.addEventListener("DOMContentLoaded", carregarListaDeDivida);