import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    runTransaction,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";

const abrirPerfil = document.getElementById("abrirPerfil");
const fecharPerfil = document.getElementById("fecharPerfil");
const modalPerfil = document.getElementById("modalPerfil");
const perfilTab = document.getElementById("perfilTab");
const configuracoesTab = document.getElementById("configuracoesTab");
const info = document.getElementById("info");
const abrirProjetos = document.getElementById("abrirProjetos");
const modalProjetos = document.getElementById("modalProjetos");
const fecharProjetos = document.getElementById("fecharProjetos");

const projectName = document.getElementById("projectName");
const addProject = document.getElementById("addProject");

const criarNovoProjeto = document.getElementById("criarNovoProjeto");

const boardContainer = document.querySelector(".board");
const projetos = [];
const projetosEmExclusao = new Set();
let quadros = [];
let usuarioAtual = null;
let projetoAtual = null;
let geracaoDeCarregamento = 0;
let geracaoDeQuadros = 0;
const operacoesDeQuadro = new Set();

const coresQuadros = [
    "quadro-azul",
    "quadro-amarelo",
    "quadro-vermelho"
];

const projetoPadrao = {
    id: "project-001",
    nome: "Projeto 001",
    descricao: "",
    ordem: 0
};

const projetosRef = (uid) =>
    collection(db, "users", uid, "projects");

const quadrosRef = (uid, projectId) =>
    collection(db, "users", uid, "projects", projectId, "boards");

function reportarErro(mensagem, error) {
    console.error(mensagem, error);
    alert(mensagem);
}

function abrirModal(modal) {
    modal.classList.add("ativo");
}

function fecharModal(modal) {
    modal.classList.remove("ativo");
}

function mostrarPerfil() {
    perfilTab.classList.add("active");
    configuracoesTab.classList.remove("active");

    const currentProfile = window.currentUserProfile || {
        name: "Usuário",
        email: ""
    };

    info.innerHTML = `
        <div class="profile-content">
            <h2>Perfil</h2>

            <div class="profile-user">
                <div class="user"></div>

                <div>
                    <strong>${currentProfile.name || "Usuário"}</strong>
                    <p>${currentProfile.email || ""}</p>
                </div>
            </div>

            <p>Nome: ${currentProfile.name || "Usuário"}</p>
            <p>Email: ${currentProfile.email || ""}</p>
        </div>
    `;
}

function mostrarConfiguracoes() {
    configuracoesTab.classList.add("active");
    perfilTab.classList.remove("active");

    const darkMode =
        localStorage.getItem("taskly-dark-mode") === "true";

    info.innerHTML = `
        <div class="settings-content">
            <h2>Configurações</h2>

            <div class="setting">
                <span>Modo noturno</span>

                <label class="switch">
                    <input
                        type="checkbox"
                        id="modoNoturno"
                        ${darkMode ? "checked" : ""}
                    >
                    <span class="slider"></span>
                </label>
            </div>

            <button
                type="button"
                class="logout-button"
                id="logoutButton"
            >
                Sair da conta
            </button>
        </div>
    `;

    const modoNoturno = document.getElementById("modoNoturno");

    if (modoNoturno) {
        modoNoturno.addEventListener("change", alterarModoNoturno);
    }

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (typeof window.logoutCurrentUser === "function") {
                window.logoutCurrentUser();
            }
        });
    }
}

function alterarModoNoturno(event) {
    const ativo = event.target.checked;

    document.body.classList.toggle("dark-mode", ativo);

    localStorage.setItem(
        "taskly-dark-mode",
        ativo ? "true" : "false"
    );
}

async function carregarProjetos(usuario) {
    let snapshot = await getDocs(projetosRef(usuario.uid));

    if (snapshot.empty) {
        const referencia = doc(
            db,
            "users",
            usuario.uid,
            "projects",
            projetoPadrao.id
        );

        await runTransaction(db, async (transacao) => {
            const projetoExistente = await transacao.get(referencia);

            if (!projetoExistente.exists()) {
                const { id, ...dados } = projetoPadrao;
                transacao.set(referencia, dados);
            }
        });

        snapshot = await getDocs(projetosRef(usuario.uid));
    }

    return snapshot.docs
        .map((projetoDoc) => ({
            id: projetoDoc.id,
            ...projetoDoc.data()
        }))
        .sort((primeiro, segundo) => primeiro.ordem - segundo.ordem);
}

function guardarSelecaoProjeto(projeto) {
    try {
        localStorage.setItem("taskly-project-id", projeto.id);
        localStorage.setItem("taskly-project-name", projeto.nome);
    } catch (error) {
        console.warn("Não foi possível guardar o projeto selecionado.", error);
    }
}

function limparSelecaoProjeto() {
    try {
        localStorage.removeItem("taskly-project-id");
        localStorage.removeItem("taskly-project-name");
    } catch (error) {
        console.warn("Não foi possível limpar o projeto selecionado.", error);
    }
}

function renderizarProjetos() {
    const lista = document.getElementById("projectsList");
    lista.replaceChildren();

    projetos.forEach((projeto) => {
        const item = document.createElement("div");
        const detalhes = document.createElement("div");
        const nome = document.createElement("p");
        const descricao = document.createElement("span");
        const seta = document.createElement("span");
        const excluir = document.createElement("button");

        item.classList.add("project-item");
        detalhes.classList.add("project-details");
        nome.textContent = projeto.nome;
        descricao.textContent = projeto.descricao;
        seta.classList.add("project-arrow");
        seta.textContent = "→";
        excluir.type = "button";
        excluir.classList.add("project-delete");
        excluir.textContent = "×";
        excluir.disabled = projetos.length === 1;
        excluir.title = excluir.disabled
            ? "Mantenha pelo menos um projeto"
            : `Excluir ${projeto.nome}`;
        excluir.setAttribute("aria-label", excluir.title);

        detalhes.append(nome, descricao);
        item.append(detalhes, seta, excluir);
        item.addEventListener("click", () => {
            void selecionarProjeto(projeto);
        });
        excluir.addEventListener("click", (event) => {
            event.stopPropagation();
            void excluirProjeto(projeto);
        });
        lista.appendChild(item);
    });

    const novoProjeto = document.createElement("div");
    const detalhesNovoProjeto = document.createElement("div");
    const tituloNovoProjeto = document.createElement("p");
    const descricaoNovoProjeto = document.createElement("span");

    novoProjeto.classList.add("project-item", "new-project-item");
    tituloNovoProjeto.textContent = "+ Novo projeto";
    descricaoNovoProjeto.textContent = "Criar um novo projeto";
    detalhesNovoProjeto.append(tituloNovoProjeto, descricaoNovoProjeto);
    novoProjeto.appendChild(detalhesNovoProjeto);
    novoProjeto.addEventListener("click", criarProjeto);
    lista.appendChild(novoProjeto);
}

async function excluirProjeto(projeto) {
    const usuario = usuarioAtual;

    if (
        !usuario ||
        projetos.length <= 1 ||
        projetosEmExclusao.has(projeto.id)
    ) {
        return;
    }

    const confirmou = window.confirm(
        `Excluir o projeto "${projeto.nome}" e todos os quadros dele? Essa ação não pode ser desfeita.`
    );

    if (!confirmou) {
        return;
    }

    projetosEmExclusao.add(projeto.id);

    try {
        const quadrosDoProjeto = await getDocs(
            quadrosRef(usuario.uid, projeto.id)
        );

        for (const quadro of quadrosDoProjeto.docs) {
            await deleteDoc(quadro.ref);
        }

        await deleteDoc(
            doc(db, "users", usuario.uid, "projects", projeto.id)
        );

        if (usuarioAtual?.uid !== usuario.uid) {
            return;
        }

        const indiceProjeto = projetos.findIndex(
            (item) => item.id === projeto.id
        );

        if (indiceProjeto === -1) {
            return;
        }

        projetos.splice(indiceProjeto, 1);

        if (projetoAtual?.id === projeto.id) {
            projetoAtual = null;
            geracaoDeQuadros++;

            if (projetos.length > 0) {
                await selecionarProjeto(projetos[0], false);
            } else {
                projectName.value = "";
                limparSelecaoProjeto();
                quadros = [];
                renderizarQuadros();
            }
        }

        renderizarProjetos();
    } catch (error) {
        reportarErro("Não foi possível excluir o projeto. Tente novamente.", error);
    } finally {
        projetosEmExclusao.delete(projeto.id);
    }
}

async function selecionarProjeto(projeto, fecharLista = true) {
    if (!usuarioAtual || !projetos.some((item) => item.id === projeto.id)) {
        return;
    }

    projetoAtual = projeto;
    projectName.value = projeto.nome;
    guardarSelecaoProjeto(projeto);

    if (fecharLista) {
        fecharModal(modalProjetos);
    }

    await carregarQuadros(projeto);
}

function mostrarProjetos() {
    renderizarProjetos();
}

async function criarProjeto() {
    const nome = prompt("Nome do novo projeto:");

    if (!nome || nome.trim() === "") {
        return;
    }

    const usuario = usuarioAtual;

    if (!usuario) {
        reportarErro("Sua sessão ainda não está pronta. Tente novamente.");
        return;
    }

    const ordem = projetos.reduce(
        (maiorOrdem, projeto) => Math.max(maiorOrdem, projeto.ordem),
        -1
    ) + 1;

    try {
        const referencia = await addDoc(projetosRef(usuario.uid), {
            nome: nome.trim(),
            descricao: "Novo projeto",
            ordem
        });

        if (usuarioAtual?.uid !== usuario.uid) {
            return;
        }

        const novoProjeto = {
            id: referencia.id,
            nome: nome.trim(),
            descricao: "Novo projeto",
            ordem
        };

        projetos.push(novoProjeto);
        projetos.sort((primeiro, segundo) => primeiro.ordem - segundo.ordem);
        renderizarProjetos();
        await selecionarProjeto(novoProjeto, false);
    } catch (error) {
        reportarErro("Não foi possível criar o projeto. Tente novamente.", error);
    }
}

async function carregarQuadros(projeto) {
    const usuario = usuarioAtual;
    const geracaoAtual = ++geracaoDeQuadros;

    quadros = [];
    renderizarQuadros();

    if (!usuario) {
        return;
    }

    try {
        const snapshot = await getDocs(quadrosRef(usuario.uid, projeto.id));

        if (
            geracaoAtual !== geracaoDeQuadros ||
            usuarioAtual?.uid !== usuario.uid ||
            projetoAtual?.id !== projeto.id
        ) {
            return;
        }

        quadros = snapshot.docs
            .map((quadroDoc) => ({
                id: quadroDoc.id,
                ...quadroDoc.data()
            }))
            .sort((primeiro, segundo) => primeiro.ordem - segundo.ordem);

        renderizarQuadros();
    } catch (error) {
        if (geracaoAtual === geracaoDeQuadros) {
            reportarErro("Não foi possível carregar os quadros. Tente novamente.", error);
        }
    }
}

function renderizarQuadros() {
    boardContainer.querySelectorAll(".board-card").forEach((cartao) => {
        cartao.remove();
    });

    quadros.forEach((dadosQuadro) => {
        addProject.before(criarElementoQuadro(dadosQuadro));
    });
}

function criarElementoQuadro(dadosQuadro) {
    const cartao = document.createElement("div");
    const titulo = document.createElement("input");
    const listaItens = document.createElement("div");
    const adicionarItem = document.createElement("button");
    const excluirQuadro = document.createElement("button");

    cartao.classList.add("board-card");
    cartao.dataset.boardId = dadosQuadro.id;
    cartao.classList.add(
        coresQuadros.includes(dadosQuadro.cor)
            ? dadosQuadro.cor
            : coresQuadros[dadosQuadro.ordem % coresQuadros.length]
    );

    titulo.classList.add("board-card-title");
    titulo.type = "text";
    titulo.value = dadosQuadro.nome;
    titulo.setAttribute("aria-label", "Nome do quadro");

    listaItens.classList.add("board-items");
    listaItens.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        listaItens.classList.add("drag-over");
    });
    listaItens.addEventListener("dragleave", (event) => {
        if (!listaItens.contains(event.relatedTarget)) {
            listaItens.classList.remove("drag-over");
        }
    });
    listaItens.addEventListener("drop", (event) => {
        event.preventDefault();
        listaItens.classList.remove("drag-over");

        try {
            const origem = JSON.parse(
                event.dataTransfer.getData("text/plain")
            );
            const quadroOrigem = quadros.find(
                (quadro) => quadro.id === origem.quadroId
            );

            if (quadroOrigem && quadroOrigem.id !== dadosQuadro.id) {
                void moverItemEntreQuadros(
                    quadroOrigem,
                    dadosQuadro,
                    origem.indice,
                    origem.nome
                );
            }
        } catch (error) {
            console.warn("Não foi possível mover o item.", error);
        }
    });

    if (dadosQuadro.itens.length === 0) {
        const vazio = document.createElement("p");
        vazio.classList.add("empty-board");
        vazio.textContent = "Nenhum item adicionado";
        listaItens.appendChild(vazio);
    } else {
        dadosQuadro.itens.forEach((nomeItem, indice) => {
            listaItens.appendChild(
                criarElementoItem(dadosQuadro, nomeItem, indice)
            );
        });
    }

    adicionarItem.classList.add("add-item");
    adicionarItem.type = "button";
    adicionarItem.textContent = "+ Adicionar item";
    adicionarItem.addEventListener("click", () => {
        const nomeItem = prompt("Nome do item:");

        if (nomeItem && nomeItem.trim()) {
            void adicionarItemAoQuadro(dadosQuadro, nomeItem.trim());
        }
    });

    excluirQuadro.classList.add("delete-board");
    excluirQuadro.type = "button";
    excluirQuadro.title = "Excluir quadro";
    excluirQuadro.textContent = "×";
    excluirQuadro.addEventListener("click", () => {
        void excluirQuadroPersistido(dadosQuadro);
    });

    titulo.addEventListener("change", () => {
        const novoNome = titulo.value.trim() || "Novo quadro";
        titulo.value = dadosQuadro.nome;

        if (novoNome !== dadosQuadro.nome) {
            void renomearQuadro(dadosQuadro, novoNome);
        }
    });

    cartao.append(titulo, listaItens, adicionarItem, excluirQuadro);
    return cartao;
}

function criarElementoItem(dadosQuadro, nomeItem, indice) {
    const item = document.createElement("div");
    const texto = document.createElement("span");
    const excluir = document.createElement("button");

    item.classList.add("board-item");
    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
        if (event.target.closest("button")) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
                quadroId: dadosQuadro.id,
                indice,
                nome: nomeItem
            })
        );
    });
    texto.textContent = nomeItem;
    excluir.type = "button";
    excluir.classList.add("delete-item");
    excluir.title = "Excluir item";
    excluir.textContent = "×";
    excluir.addEventListener("click", () => {
        void excluirItemDoQuadro(dadosQuadro, indice);
    });
    item.append(texto, excluir);

    return item;
}

async function moverItemEntreQuadros(
    quadroOrigem,
    quadroDestino,
    indice,
    nomeItem
) {
    const usuario = usuarioAtual;
    const projeto = projetoAtual;

    if (
        !usuario ||
        !projeto ||
        !Number.isInteger(indice) ||
        !quadros.includes(quadroOrigem) ||
        !quadros.includes(quadroDestino)
    ) {
        return;
    }

    const chavesOperacao = [quadroOrigem.id, quadroDestino.id]
        .sort()
        .map((boardId) => `${usuario.uid}:${projeto.id}:${boardId}`);

    if (chavesOperacao.some((chave) => operacoesDeQuadro.has(chave))) {
        return;
    }

    chavesOperacao.forEach((chave) => operacoesDeQuadro.add(chave));

    try {
        const itensAtualizados = await runTransaction(db, async (transacao) => {
            const referenciaOrigem = doc(
                db,
                "users",
                usuario.uid,
                "projects",
                projeto.id,
                "boards",
                quadroOrigem.id
            );
            const referenciaDestino = doc(
                db,
                "users",
                usuario.uid,
                "projects",
                projeto.id,
                "boards",
                quadroDestino.id
            );
            const [snapshotOrigem, snapshotDestino] = await Promise.all([
                transacao.get(referenciaOrigem),
                transacao.get(referenciaDestino)
            ]);

            if (!snapshotOrigem.exists() || !snapshotDestino.exists()) {
                throw new Error("Um dos quadros não existe mais.");
            }

            const itensOrigem = [...snapshotOrigem.data().itens];
            const itensDestino = [...snapshotDestino.data().itens];

            if (itensOrigem[indice] !== nomeItem) {
                throw new Error("O item mudou antes de ser movido.");
            }

            itensOrigem.splice(indice, 1);
            itensDestino.push(nomeItem);

            transacao.update(referenciaOrigem, { itens: itensOrigem });
            transacao.update(referenciaDestino, { itens: itensDestino });

            return { itensOrigem, itensDestino };
        });

        if (
            usuarioAtual?.uid !== usuario.uid ||
            projetoAtual?.id !== projeto.id
        ) {
            return;
        }

        quadroOrigem.itens = itensAtualizados.itensOrigem;
        quadroDestino.itens = itensAtualizados.itensDestino;
        renderizarQuadros();
    } catch (error) {
        reportarErro("Não foi possível mover o item. Tente novamente.", error);
    } finally {
        chavesOperacao.forEach((chave) => operacoesDeQuadro.delete(chave));
    }
}

async function atualizarQuadroPersistido(dadosQuadro, alteracoes, erro) {
    const usuario = usuarioAtual;
    const projeto = projetoAtual;

    if (!usuario || !projeto) {
        return false;
    }

    const chave = `${usuario.uid}:${projeto.id}:${dadosQuadro.id}`;
    if (operacoesDeQuadro.has(chave)) {
        return false;
    }

    operacoesDeQuadro.add(chave);

    try {
        await updateDoc(
            doc(db, "users", usuario.uid, "projects", projeto.id, "boards", dadosQuadro.id),
            alteracoes
        );

        if (
            usuarioAtual?.uid === usuario.uid &&
            projetoAtual?.id === projeto.id
        ) {
            Object.assign(dadosQuadro, alteracoes);
            renderizarQuadros();
        }

        return true;
    } catch (error) {
        reportarErro(erro, error);
        return false;
    } finally {
        operacoesDeQuadro.delete(chave);
    }
}

async function renomearQuadro(dadosQuadro, nome) {
    await atualizarQuadroPersistido(
        dadosQuadro,
        { nome },
        "Não foi possível renomear o quadro. Tente novamente."
    );
}

async function adicionarItemAoQuadro(dadosQuadro, nomeItem) {
    await atualizarQuadroPersistido(
        dadosQuadro,
        { itens: [...dadosQuadro.itens, nomeItem] },
        "Não foi possível adicionar o item. Tente novamente."
    );
}

async function excluirItemDoQuadro(dadosQuadro, indice) {
    const itens = [...dadosQuadro.itens];
    itens.splice(indice, 1);
    await atualizarQuadroPersistido(
        dadosQuadro,
        { itens },
        "Não foi possível excluir o item. Tente novamente."
    );
}

async function excluirQuadroPersistido(dadosQuadro) {
    const usuario = usuarioAtual;
    const projeto = projetoAtual;

    if (!usuario || !projeto) {
        return;
    }

    try {
        await deleteDoc(
            doc(db, "users", usuario.uid, "projects", projeto.id, "boards", dadosQuadro.id)
        );

        if (
            usuarioAtual?.uid === usuario.uid &&
            projetoAtual?.id === projeto.id
        ) {
            quadros = quadros.filter((quadro) => quadro.id !== dadosQuadro.id);
            renderizarQuadros();
        }
    } catch (error) {
        reportarErro("Não foi possível excluir o quadro. Tente novamente.", error);
    }
}

async function criarQuadro(nome) {
    const usuario = usuarioAtual;
    const projeto = projetoAtual;

    if (!usuario || !projeto) {
        reportarErro("Selecione um projeto antes de criar um quadro.");
        return;
    }

    const ordem = quadros.reduce(
        (maiorOrdem, quadro) => Math.max(maiorOrdem, quadro.ordem),
        -1
    ) + 1;
    const dados = {
        nome,
        ordem,
        cor: coresQuadros[ordem % coresQuadros.length],
        itens: []
    };

    try {
        const referencia = await addDoc(quadrosRef(usuario.uid, projeto.id), dados);

        if (
            usuarioAtual?.uid === usuario.uid &&
            projetoAtual?.id === projeto.id
        ) {
            quadros.push({ id: referencia.id, ...dados });
            quadros.sort((primeiro, segundo) => primeiro.ordem - segundo.ordem);
            renderizarQuadros();

            const cartao = Array.from(
                boardContainer.querySelectorAll(".board-card")
            ).find((elemento) => elemento.dataset.boardId === referencia.id);
            const titulo = cartao?.querySelector(".board-card-title");
            titulo?.focus();
            titulo?.select();
        }
    } catch (error) {
        reportarErro("Não foi possível criar o quadro. Tente novamente.", error);
    }
}

async function carregarProjetosDoUsuario(usuario, geracaoAtual) {
    try {
        const projetosCarregados = await carregarProjetos(usuario);

        if (
            geracaoAtual !== geracaoDeCarregamento ||
            usuarioAtual?.uid !== usuario.uid
        ) {
            return;
        }

        projetos.splice(0, projetos.length, ...projetosCarregados);
        renderizarProjetos();

        let idSalvo = null;
        let nomeLegado = null;

        try {
            idSalvo = localStorage.getItem("taskly-project-id");
            nomeLegado = localStorage.getItem("taskly-project-name");
        } catch (error) {
            console.warn("Não foi possível restaurar o projeto selecionado.", error);
        }

        const projetoSalvo = projetos.find((projeto) => projeto.id === idSalvo);
        const projetoLegado = projetos.find((projeto) => projeto.nome === nomeLegado);
        const projetoSelecionado = projetoSalvo || projetoLegado || projetos[0];

        if (projetoSelecionado) {
            await selecionarProjeto(projetoSelecionado, false);
        } else {
            projetoAtual = null;
            projectName.value = "";
            limparSelecaoProjeto();
            quadros = [];
            renderizarQuadros();
        }
    } catch (error) {
        if (
            geracaoAtual === geracaoDeCarregamento &&
            usuarioAtual?.uid === usuario.uid
        ) {
            reportarErro("Não foi possível carregar os projetos. Tente novamente.", error);
        }
    }
}

async function salvarNomeProjeto() {
    const usuario = usuarioAtual;
    const projeto = projetoAtual;

    if (!usuario || !projeto) {
        projectName.value = projeto?.nome || "";
        return;
    }

    const nomeAnterior = projeto.nome;
    const novoNome = projectName.value.trim();
    projectName.value = nomeAnterior;

    if (!novoNome || novoNome === nomeAnterior) {
        return;
    }

    try {
        await updateDoc(
            doc(db, "users", usuario.uid, "projects", projeto.id),
            { nome: novoNome }
        );

        projeto.nome = novoNome;

        if (
            usuarioAtual?.uid === usuario.uid &&
            projetoAtual?.id === projeto.id
        ) {
            projectName.value = novoNome;
            guardarSelecaoProjeto(projeto);
            renderizarProjetos();
        }
    } catch (error) {
        if (
            usuarioAtual?.uid === usuario.uid &&
            projetoAtual?.id === projeto.id
        ) {
            projectName.value = nomeAnterior;
        }

        reportarErro("Não foi possível renomear o projeto. Tente novamente.", error);
    }
}

abrirPerfil.addEventListener("click", () => {
    abrirModal(modalPerfil);
    mostrarPerfil();
});

fecharPerfil.addEventListener("click", () => {
    fecharModal(modalPerfil);
});

modalPerfil.addEventListener("click", (event) => {
    if (event.target === modalPerfil) {
        fecharModal(modalPerfil);
    }
});

perfilTab.addEventListener("click", (event) => {
    event.preventDefault();
    mostrarPerfil();
});

configuracoesTab.addEventListener("click", (event) => {
    event.preventDefault();
    mostrarConfiguracoes();
});

abrirProjetos.addEventListener("click", () => {
    mostrarProjetos();
    abrirModal(modalProjetos);
});

fecharProjetos.addEventListener("click", () => {
    fecharModal(modalProjetos);
});

modalProjetos.addEventListener("click", (event) => {
    if (event.target === modalProjetos) {
        fecharModal(modalProjetos);
    }
});

if (criarNovoProjeto) {
    criarNovoProjeto.addEventListener(
        "click",
        criarProjeto
    );
}

addProject.addEventListener("click", () => {
    const nome = prompt("Nome do novo quadro:");

    if (!nome || nome.trim() === "") {
        return;
    }

    criarQuadro(nome.trim());
});

projectName.addEventListener("change", () => {
    void salvarNomeProjeto();
});

if (
    localStorage.getItem("taskly-dark-mode") === "true"
) {
    document.body.classList.add("dark-mode");
}

mostrarPerfil();

onAuthStateChanged(auth, (usuario) => {
    const geracaoAtual = ++geracaoDeCarregamento;
    usuarioAtual = usuario;
    projetoAtual = null;
    geracaoDeQuadros++;
    projetos.length = 0;
    quadros = [];
    projectName.value = "";
    renderizarProjetos();
    renderizarQuadros();

    if (usuario) {
        void carregarProjetosDoUsuario(usuario, geracaoAtual);
    }
});