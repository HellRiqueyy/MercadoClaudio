import { db } from "./firebaseConfig.js"
import { collection, addDoc, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
function getInput() {

    return {
        name: document.getElementById("name-divida"),
        telefone: document.getElementById("telefone-divida"),
        valor: document.getElementById("valor-divida"),
        juros: document.getElementById("juros-divida"),
        data: document.getElementById("data-divida")
    }
}

function getValores({ name, telefone, valor, juros, data }) {
    const nome = name.value.trim();
    const telefoneVal = telefone.value.trim();
    const valorNum = parseFloat(valor.value) || 0;
    const jurosInput = parseFloat(juros.value) || 0;
    const dataCobranca = data.value;

    return {
        nome,
        telefone: telefoneVal,
        valor: valorNum,
        juros: jurosInput,
        data: dataCobranca
    }
}

document.getElementById("btnCadastrar-divida").addEventListener("click", async function () {
    const Inputs = getInput()
    if (!Inputs.name.value.trim() || !Inputs.telefone.value.trim() || !Inputs.valor.value.trim() || !Inputs.juros.value.trim() || !Inputs.data.value) {
        alert("Todos os campos são obrigatórios!");
        return;
    }
    const dados = getValores(Inputs)
    console.log("dados", dados)

    try {
        const telefoneVal = dados.telefone;
        const dividasRef = collection(db, "divida");
        const q = query(dividasRef, where("telefone", "==", telefoneVal));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const docRef = snap.docs[0].ref;
            await updateDoc(docRef, dados);
            alert("Dívida atualizada com sucesso!");
        } else {
            await addDoc(dividasRef, dados);
            alert("Dívida cadastrada com sucesso!");
        }
    } catch (e) {
        console.log("Erro: ", e)
    }
})