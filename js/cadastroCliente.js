import { db } from "./firebaseConfig.js"
import { collection, addDoc, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"
function getInput() {

    return {
        name: document.getElementById("name"),
        telefone: document.getElementById("telefone"),
        valor: document.getElementById("valor"),
        juros: document.getElementById("juros"),
        data: document.getElementById("data")
    }
}

function getValores({ name, telefone, valor, juros, data }) {
    const nome = name.value.trim();
    const telefoneVal = telefone.value.trim();
    const valorNum = parseFloat(valor.value) || 0;
    const jurosInput = parseFloat(juros.value) || 0;
    const dataCobranca = data.value;

    let jurosAplicado = 0;
    let valorComJuros = valorNum;
    if (dataCobranca) {
        const cobrancaDate = new Date(dataCobranca);
        const hoje = new Date();
        const diffMs = hoje - cobrancaDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 30 && jurosInput > 0) {
            jurosAplicado = jurosInput;
            const adicional = (valorNum * jurosAplicado) / 100;
            valorComJuros = Math.round((valorNum + adicional) * 100) / 100;
        }
    }

    return {
        nome,
        telefone: telefoneVal,
        valor: valorNum,
        juros: jurosAplicado,
        valorComJuros,
        data: dataCobranca
    }
}

document.getElementById("btnCadastrar").addEventListener("click", async function () {
    const Inputs = getInput()
    const dados = getValores(Inputs)
    console.log("dados", dados)

    try {
        const telefoneVal = dados.telefone;
        const clientesRef = collection(db, "cliente");
        const q = query(clientesRef, where("telefone", "==", telefoneVal));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const docRef = snap.docs[0].ref;
            await updateDoc(docRef, dados);
            alert("Cliente atualizado com sucesso!");
        } else {
            await addDoc(clientesRef, dados);
            alert("Cliente cadastrado com sucesso!");
        }
    } catch (e) {
        console.log("Erro: ", e)
    }
})