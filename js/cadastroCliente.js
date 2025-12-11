import { db } from "./firebaseConfig.js"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
function getInput() {

    return {
        name: document.getElementById("name"),
        telefone: document.getElementById("telefone"),
        cpf: document.getElementById("cpf"),
        nivel: document.getElementById("nivel")
    }
}

function getValores({ name, telefone, cpf, nivel }) {
    return {
        nome: name.value.trim(),
        telefone: parseInt(telefone.value),
        cpf: cpf.value.trim(),
        nivel: nivel.value.trim()
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