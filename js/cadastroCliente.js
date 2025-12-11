import { db } from "./firebaseConfig.js"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
function getInput() {

    return {
        name: document.getElementById("name"),
        telefone: document.getElementById("telefone"),
        valor: document.getElementById("valor"),
        juros: document.getElementById("juros")
    }
}

function getValores({ name, telefone, valor, juros }) {
    return {
        nome: name.value.trim(),
        telefone: telefone.value.trim(),
        valor: parseInt(valor.value),
        juros: parseInt(juros.value)
    }
}

document.getElementById("btnCadastrar").addEventListener("click", async function () {
    const Inputs = getInput()
    const dados = getValores(Inputs)
    console.log("dados", dados)

    try {
        const ref = await addDoc(collection(db, "clientes"), dados);
        alert("Cliente cadastrado com sucesso!")
    } catch (e) {
        console.log("Erro: ", e)
    }
})              