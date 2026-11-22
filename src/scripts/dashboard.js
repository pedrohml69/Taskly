import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================
   DADOS
========================= */

const tarefas = [];
const projetosRotina = [];
const atualizacoesEmAndamento = new Set();
let usuarioAtual = null;
let geracaoDeCarregamento = 0;


/* =========================
   ELEMENTOS
========================= */

const dashboardSidebar =
    document.getElementById("dashboardSidebar");

const toggleSidebar =
    document.getElementById("toggleSidebar");

const sidebarOptions =
    document.querySelectorAll(".sidebar-option");

const dashboardSections =
    document.querySelectorAll(".dashboard-section");

const daysHeader =
    document.getElementById("daysHeader");

const calendarBody =
    document.getElementById("calendarBody");

const weekTitle =
    document.getElementById("weekTitle");

const weekRange =
    document.getElementById("weekRange");

const previousWeek =
    document.getElementById("previousWeek");

const nextWeek =
    document.getElementById("nextWeek");

const addTaskButton =
    document.getElementById("addTaskButton");

const taskModal =
    document.getElementById("taskModal");

const closeTaskModal =
    document.getElementById("closeTaskModal");

const saveTask =
    document.getElementById("saveTask");

const taskName =
    document.getElementById("taskName");

const taskDate =
    document.getElementById("taskDate");

const taskTime =
    document.getElementById("taskTime");

const associateProjectButton =
    document.getElementById("associateProjectButton");

const projectAssociationModal =
    document.getElementById("projectAssociationModal");

const closeProjectAssociationModal =
    document.getElementById("closeProjectAssociationModal");

const saveProjectAssociation =
    document.getElementById("saveProjectAssociation");

const projectAssociationSelect =
    document.getElementById("projectAssociationSelect");

const projectAssociationTime =
    document.getElementById("projectAssociationTime");


/* =========================
   DATA
========================= */

const hoje = zerarHora(new Date());

let inicioSemana =
    encontrarInicioSemana(hoje);


/* =========================
   FUNÇÕES DE DATA
========================= */

function zerarHora(data) {

    const novaData =
        new Date(data);

    novaData.setHours(
        0,
        0,
        0,
        0
    );

    return novaData;
}


function obterDataAtual() {

    return formatarData(
        new Date()
    );
}


function formatarData(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function encontrarInicioSemana(data) {

    const resultado =
        new Date(data);

    const dia =
        resultado.getDay();

    /*
        Domingo = 0
        Segunda = 1

        A semana começa na segunda.
    */

    const diferenca =
        dia === 0
            ? 6
            : dia - 1;

    resultado.setDate(
        resultado.getDate() - diferenca
    );

    return zerarHora(resultado);
}


function adicionarDias(data, quantidade) {

    const resultado =
        new Date(data);

    resultado.setDate(
        resultado.getDate() + quantidade
    );

    return resultado;
}


function formatarDataCurta(data) {

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );
}

function obterHorasRotina() {
    const horas = [];

    for (let hora = 4; hora < 24; hora++) {
        horas.push(hora);
    }

    for (let hora = 0; hora <= 3; hora++) {
        horas.push(hora);
    }

    return horas;
}

async function carregarProjetosDaRotina(usuario) {
    const snapshot = await getDocs(
        collection(db, "users", usuario.uid, "projects")
    );

    const projetos = await Promise.all(
        snapshot.docs.map(async (projetoDoc) => {
            const dados = projetoDoc.data();
            let quadros = [];
            let erroQuadros = false;

            try {
                const quadrosSnapshot = await getDocs(
                    collection(db, "users", usuario.uid, "projects", projetoDoc.id, "boards")
                );

                quadros = quadrosSnapshot.docs.map((quadroDoc) => ({
                    id: quadroDoc.id,
                    ...quadroDoc.data()
                }));
            } catch (error) {
                erroQuadros = true;
                console.error(`Não foi possível carregar os quadros do projeto ${projetoDoc.id}.`, error);
            }

            return {
                id: projetoDoc.id,
                nome: dados.nome,
                descricao: dados.descricao || "",
                rotina: dados.rotina || null,
                quadros,
                erroQuadros
            };
        })
    );

    return projetos;
}

function atualizarListaProjetosDisponiveis() {
    if (!usuarioAtual) {
        projectAssociationSelect.innerHTML = '<option value="">Selecione um projeto</option>';
        return;
    }

    const options = ['<option value="">Selecione um projeto</option>'];

    projetosRotina.forEach((projeto) => {
        options.push(`<option value="${projeto.id}">${projeto.nome}</option>`);
    });

    projectAssociationSelect.innerHTML = options.join("");
}

function abrirModalAssociacaoProjeto() {
    if (!usuarioAtual) {
        alert("Sua sessão ainda não está pronta. Tente novamente.");
        return;
    }

    atualizarListaProjetosDisponiveis();
    projectAssociationModal.classList.add("ativo");
}

function fecharModalAssociacaoProjeto() {
    projectAssociationModal.classList.remove("ativo");
    projectAssociationSelect.value = "";
    projectAssociationTime.value = "08:00";
}

async function removerProjetoDaRotina(projetoId) {
    const usuario = usuarioAtual;

    if (!usuario) {
        return;
    }

    if (!usuario.emailVerified) {
        return;
    }

    try {
        await updateDoc(
            doc(db, "users", usuario.uid, "projects", projetoId),
            { rotina: deleteField() }
        );

        const projeto = projetosRotina.find((item) => item.id === projetoId);

        if (projeto) {
            delete projeto.rotina;
        }

        renderizarCalendario();
    } catch (error) {
        console.error("Não foi possível remover o projeto da rotina.", error);
        alert("Não foi possível remover o projeto da rotina. Tente novamente.");
    }
}

function renderizarProjetoRotinaNoHorario(cell, projetosDoHorario) {
    projetosDoHorario.forEach((projeto) => {
        const projetoElemento = document.createElement("div");
        projetoElemento.classList.add("calendar-project");

        const cabecalho = document.createElement("div");
        cabecalho.classList.add("calendar-project-header");

        const nomeElemento = document.createElement("strong");
        nomeElemento.textContent = projeto.nome;

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.classList.add("calendar-task-delete");
        botaoExcluir.textContent = "×";
        botaoExcluir.title = `Remover ${projeto.nome} da rotina`;
        botaoExcluir.setAttribute("aria-label", `Remover ${projeto.nome} da rotina`);

        botaoExcluir.addEventListener("click", async (event) => {
            event.stopPropagation();
            await removerProjetoDaRotina(projeto.id);
        });

        cabecalho.append(nomeElemento, botaoExcluir);

        const detalhes = document.createElement("details");
        detalhes.classList.add("calendar-project-details");

        const resumo = document.createElement("summary");
        resumo.textContent = projeto.erroQuadros
            ? "Quadros indisponíveis"
            : `Quadros e itens (${projeto.quadros.length})`;

        const listaQuadros = document.createElement("div");
        listaQuadros.classList.add("calendar-project-items");

        if (projeto.quadros.length === 0) {
            const mensagem = document.createElement("span");
            mensagem.textContent = projeto.erroQuadros
                ? "Não foi possível carregar os quadros deste projeto."
                : "Sem quadros no momento";
            listaQuadros.appendChild(mensagem);
        } else {
            projeto.quadros.forEach((quadro) => {
                const quadroElemento = document.createElement("section");
                quadroElemento.classList.add("calendar-project-board");

                const nomeQuadro = document.createElement("strong");
                nomeQuadro.textContent = quadro.nome || "Quadro";
                quadroElemento.appendChild(nomeQuadro);

                const itens = Array.isArray(quadro.itens) ? quadro.itens : [];

                if (itens.length === 0) {
                    const mensagem = document.createElement("span");
                    mensagem.textContent = "Sem itens neste quadro";
                    quadroElemento.appendChild(mensagem);
                } else {
                    const lista = document.createElement("ul");

                    itens.forEach((texto) => {
                        const item = document.createElement("li");
                        item.textContent = texto;
                        lista.appendChild(item);
                    });

                    quadroElemento.appendChild(lista);
                }

                listaQuadros.appendChild(quadroElemento);
            });
        }

        detalhes.addEventListener("click", (event) => event.stopPropagation());
        detalhes.addEventListener("dblclick", (event) => event.stopPropagation());
        detalhes.append(resumo, listaQuadros);
        projetoElemento.append(cabecalho, detalhes);
        cell.appendChild(projetoElemento);
    });
}


/* =========================
   CALENDÁRIO
========================= */

function renderizarCalendario() {

    daysHeader.innerHTML = "";
    calendarBody.innerHTML = "";

    const dias = [];

    for (let i = 0; i < 7; i++) {

        dias.push(
            adicionarDias(
                inicioSemana,
                i
            )
        );
    }


    const ultimoDia =
        dias[6];


    weekTitle.textContent =
        "Semana atual";


    weekRange.textContent =
        `${formatarDataCurta(dias[0])} - ${formatarDataCurta(ultimoDia)}`;


    /*
        Não permite voltar para uma semana
        que contenha datas anteriores ao dia atual.
    */

    const semanaAtual =
        encontrarInicioSemana(hoje);


    previousWeek.disabled =
        inicioSemana <= semanaAtual;


    /* CABEÇALHO */

    dias.forEach((dia) => {

        const header =
            document.createElement("div");

        header.classList.add(
            "day-header"
        );


        const ehHoje =
            formatarData(dia) ===
            formatarData(hoje);


        if (ehHoje) {

            header.classList.add(
                "today"
            );

        }


        const nomeDia =
            dia.toLocaleDateString(
                "pt-BR",
                {
                    weekday: "short"
                }
            );


        header.innerHTML = `
            <span>
                ${nomeDia}
            </span>

            <strong>
                ${dia.getDate()}
            </strong>
        `;


        daysHeader.appendChild(
            header
        );

    });


    /* HORÁRIOS */

    const horasRotina = obterHorasRotina();

    horasRotina.forEach((hora) => {

        const row =
            document.createElement("div");

        row.classList.add(
            "calendar-row"
        );


        const time =
            document.createElement("div");

        time.classList.add(
            "calendar-time"
        );

        const horaFormatada =
            `${String(hora).padStart(2, "0")}:00`;

        time.textContent = horaFormatada;


        row.appendChild(time);


        const days =
            document.createElement("div");

        days.classList.add(
            "calendar-days"
        );


        dias.forEach((dia) => {

            const cell =
                document.createElement("div");

            cell.classList.add(
                "calendar-cell"
            );


            const data =
                formatarData(
                    hora < 4
                        ? adicionarDias(dia, 1)
                        : dia
                );

            const tarefasDoHorario =
                tarefas.filter(
                    (tarefa) =>
                        tarefa.data === data &&
                        tarefa.horario.slice(0, 2) === horaFormatada.slice(0, 2)
                ).sort(
                    (primeira, segunda) =>
                        primeira.horario.localeCompare(segunda.horario)
                );

            const projetosDoHorario =
                projetosRotina.filter(
                    (projeto) =>
                        projeto.rotina &&
                        projeto.rotina.horario &&
                        projeto.rotina.horario.slice(0, 2) === horaFormatada.slice(0, 2)
                );

            tarefasDoHorario.forEach(
                (tarefa) => {

                    const tarefaElemento =
                        document.createElement("div");

                    tarefaElemento.classList.add(
                        "calendar-task"
                    );

                    const botaoExcluir =
                        document.createElement("button");

                    botaoExcluir.type = "button";
                    botaoExcluir.classList.add("calendar-task-delete");
                    botaoExcluir.textContent = "×";
                    botaoExcluir.title = "Excluir tarefa";
                    botaoExcluir.setAttribute(
                        "aria-label",
                        `Excluir tarefa: ${tarefa.nome}`
                    );

                    const horarioElemento =
                        document.createElement("strong");

                    horarioElemento.textContent = tarefa.horario;

                    const nomeElemento =
                        document.createElement("span");

                    nomeElemento.classList.add("calendar-task-name");
                    nomeElemento.textContent = tarefa.nome;

                    tarefaElemento.append(
                        botaoExcluir,
                        horarioElemento,
                        nomeElemento
                    );


                    if (tarefa.concluida) {

                        tarefaElemento.classList.add(
                            "completed"
                        );

                    }


                    botaoExcluir.addEventListener(
                        "click",
                        async (event) => {
                            event.stopPropagation();

                            const usuario = usuarioAtual;

                            if (!usuario) {
                                return;
                            }

                            const chaveAtualizacao =
                                `${usuario.uid}:${tarefa.id}`;

                            if (atualizacoesEmAndamento.has(chaveAtualizacao)) {
                                return;
                            }

                            atualizacoesEmAndamento.add(chaveAtualizacao);

                            try {
                                await deleteDoc(
                                    doc(db, "users", usuario.uid, "tasks", tarefa.id)
                                );

                                if (usuarioAtual?.uid !== usuario.uid) {
                                    return;
                                }

                                const indiceTarefa = tarefas.indexOf(tarefa);

                                if (indiceTarefa === -1) {
                                    return;
                                }

                                tarefas.splice(indiceTarefa, 1);
                                renderizarCalendario();
                                atualizarGraficos();
                            } catch (error) {
                                console.error("Não foi possível excluir a tarefa.", error);
                                alert("Não foi possível excluir a tarefa. Tente novamente.");
                            } finally {
                                atualizacoesEmAndamento.delete(chaveAtualizacao);
                            }
                        }
                    );


                    tarefaElemento.addEventListener(
                        "click",
                        async () => {
                            const usuario = usuarioAtual;

                            if (!usuario) {
                                return;
                            }

                            const chaveAtualizacao =
                                `${usuario.uid}:${tarefa.id}`;

                            if (atualizacoesEmAndamento.has(chaveAtualizacao)) {
                                return;
                            }

                            const novaConclusao = !tarefa.concluida;

                            atualizacoesEmAndamento.add(chaveAtualizacao);

                            try {
                                await updateDoc(
                                    doc(db, "users", usuario.uid, "tasks", tarefa.id),
                                    { concluida: novaConclusao }
                                );

                                if (
                                    usuarioAtual?.uid !== usuario.uid ||
                                    !tarefas.includes(tarefa)
                                ) {
                                    return;
                                }

                                tarefa.concluida = novaConclusao;
                                renderizarCalendario();
                                atualizarGraficos();
                            } catch (error) {
                                console.error("Não foi possível atualizar a tarefa.", error);
                                alert("Não foi possível atualizar a tarefa. Tente novamente.");
                            } finally {
                                atualizacoesEmAndamento.delete(chaveAtualizacao);
                            }
                        }
                    );


                    cell.appendChild(
                        tarefaElemento
                    );

                }
            );

            renderizarProjetoRotinaNoHorario(cell, projetosDoHorario);

            cell.addEventListener(
                "dblclick",
                () => {

                    abrirModalTarefa(
                        data,
                        horaFormatada
                    );

                }
            );


            days.appendChild(cell);

        });


        row.appendChild(days);

        calendarBody.appendChild(row);

    });

    alinharCabecalhoCalendario();
}

function alinharCabecalhoCalendario() {
    const primeiraLinha =
        calendarBody.querySelector(".calendar-row");

    if (!primeiraLinha) {
        return;
    }

    const larguras = Array.from(
        primeiraLinha.querySelectorAll(".calendar-cell"),
        (celula) => celula.getBoundingClientRect().width
    );

    if (larguras.some((largura) => largura <= 0)) {
        return;
    }

    daysHeader.style.gridTemplateColumns =
        larguras.map((largura) => `${largura}px`).join(" ");
}

const calendarResizeObserver =
    new ResizeObserver(alinharCabecalhoCalendario);

calendarResizeObserver.observe(calendarBody);

let frameAlinhamentoCalendario = 0;

window.addEventListener("resize", () => {
    cancelAnimationFrame(frameAlinhamentoCalendario);
    frameAlinhamentoCalendario = requestAnimationFrame(
        alinharCabecalhoCalendario
    );
});


/* =========================
   NAVEGAÇÃO SEMANAL
========================= */

previousWeek.addEventListener(
    "click",
    () => {

        const novaSemana =
            adicionarDias(
                inicioSemana,
                -7
            );


        const semanaAtual =
            encontrarInicioSemana(hoje);


        if (
            novaSemana >=
            semanaAtual
        ) {

            inicioSemana =
                novaSemana;

            renderizarCalendario();

        }

    }
);


nextWeek.addEventListener(
    "click",
    () => {

        inicioSemana =
            adicionarDias(
                inicioSemana,
                7
            );

        renderizarCalendario();

    }
);

associateProjectButton.addEventListener(
    "click",
    () => {
        abrirModalAssociacaoProjeto();
    }
);

closeProjectAssociationModal.addEventListener(
    "click",
    () => {
        fecharModalAssociacaoProjeto();
    }
);

projectAssociationModal.addEventListener(
    "click",
    (event) => {
        if (event.target === projectAssociationModal) {
            fecharModalAssociacaoProjeto();
        }
    }
);

saveProjectAssociation.addEventListener(
    "click",
    async () => {
        const usuario = usuarioAtual;

        if (!usuario) {
            alert("Sua sessão ainda não está pronta. Tente novamente.");
            return;
        }

        const projetoId = projectAssociationSelect.value;
        const horario = projectAssociationTime.value;

        if (!projetoId || !horario) {
            alert("Selecione um projeto e defina um horário antes de salvar.");
            return;
        }

        try {
            await updateDoc(
                doc(db, "users", usuario.uid, "projects", projetoId),
                { rotina: { horario } }
            );

            const projetoExistente = projetosRotina.find((projeto) => projeto.id === projetoId);

            if (projetoExistente) {
                projetoExistente.rotina = { horario };
            } else {
                projetosRotina.push({
                    id: projetoId,
                    nome: projectAssociationSelect.options[projectAssociationSelect.selectedIndex]?.text || "Projeto",
                    rotina: { horario },
                    quadros: []
                });
            }

            renderizarCalendario();
            fecharModalAssociacaoProjeto();
        } catch (error) {
            console.error("Não foi possível salvar a associação do projeto.", error);
            alert("Não foi possível salvar a associação do projeto. Tente novamente.");
        }
    }
);


/* =========================
   SIDEBAR
========================= */

sidebarOptions.forEach(
    (botao) => {

        botao.addEventListener(
            "click",
            () => {

                sidebarOptions.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                botao.classList.add(
                    "active"
                );


                const secao =
                    botao.dataset.section;


                dashboardSections.forEach(
                    (section) => {

                        section.classList.remove(
                            "active"
                        );

                    }
                );


                document
                    .getElementById(secao)
                    .classList.add("active");


                if (
                    secao === "completion" ||
                    secao === "workload"
                ) {

                    atualizarGraficos();

                }

            }
        );

    }
);


/* =========================
   DIMINUIR SIDEBAR
========================= */

function atualizarSetaSidebar() {
    const recolhida = dashboardSidebar.classList.contains("collapsed");
    const mobile = window.matchMedia("(max-width: 700px)").matches;

    toggleSidebar.textContent = mobile
        ? recolhida ? "↓" : "↑"
        : recolhida ? "→" : "←";
    toggleSidebar.title = recolhida
        ? "Aumentar menu"
        : "Diminuir menu";
}

toggleSidebar.addEventListener(
    "click",
    () => {

        dashboardSidebar.classList.toggle(
            "collapsed"
        );

        atualizarSetaSidebar();
    }
);

window.addEventListener("resize", atualizarSetaSidebar);
atualizarSetaSidebar();


/* =========================
   MODAL DE TAREFA
========================= */

function abrirModalTarefa(
    data = obterDataAtual(),
    horario = "08:00"
) {

    taskModal.classList.add(
        "ativo"
    );

    taskDate.value =
        data;

    taskTime.value =
        horario;

    taskName.focus();

}


function fecharModalTarefa() {

    taskModal.classList.remove(
        "ativo"
    );

    taskName.value = "";

}


addTaskButton.addEventListener(
    "click",
    () => {

        abrirModalTarefa();

    }
);


closeTaskModal.addEventListener(
    "click",
    fecharModalTarefa
);


taskModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === taskModal
        ) {

            fecharModalTarefa();

        }

    }
);


saveTask.addEventListener(
    "click",
    async () => {
        const usuario = usuarioAtual;

        if (!usuario) {
            alert("Sua sessão ainda não está pronta. Tente novamente.");
            return;
        }

        const nome =
            taskName.value.trim();


        const data =
            taskDate.value;


        const horario =
            taskTime.value;


        if (
            nome === "" ||
            data === "" ||
            horario === ""
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;

        }


        /*
            Não permite criar tarefa
            antes da data atual.
        */

        const dataTarefa =
            zerarHora(
                new Date(`${data}T00:00:00`)
            );


        if (
            dataTarefa < hoje
        ) {

            alert(
                "Não é possível criar tarefas em uma data anterior a hoje."
            );

            return;

        }


        try {
            const tarefaRef = await addDoc(
                collection(db, "users", usuario.uid, "tasks"),
                {
                    nome,
                    data,
                    horario,
                    concluida: false
                }
            );

            if (usuarioAtual?.uid !== usuario.uid) {
                return;
            }

            tarefas.push({
                id: tarefaRef.id,
                nome,
                data,
                horario,
                concluida: false
            });

            fecharModalTarefa();
            renderizarCalendario();
            atualizarGraficos();
        } catch (error) {
            console.error("Não foi possível salvar a tarefa.", error);
            alert("Não foi possível salvar a tarefa. Tente novamente.");
        }

    }
);


/* =========================
   GRÁFICO DE CONCLUSÃO
========================= */

const periodButtons =
    document.querySelectorAll(
        ".period-button"
    );


let periodoConclusao =
    "daily";


periodButtons.forEach(
    (botao) => {

        botao.addEventListener(
            "click",
            () => {

                periodButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                botao.classList.add(
                    "active"
                );


                periodoConclusao =
                    botao.dataset.period;


                atualizarGraficoConclusao();

            }
        );

    }
);


function obterTarefasPeriodo(
    periodo
) {

    const agora =
        new Date();


    if (
        periodo === "daily"
    ) {

        const data =
            formatarData(agora);

        return tarefas.filter(
            (tarefa) =>
                tarefa.data === data
        );

    }


    if (
        periodo === "weekly"
    ) {

        const inicio =
            encontrarInicioSemana(agora);


        const fim =
            adicionarDias(
                inicio,
                7
            );


        return tarefas.filter(
            (tarefa) => {

                const data =
                    new Date(
                        `${tarefa.data}T00:00:00`
                    );


                return (
                    data >= inicio &&
                    data < fim
                );

            }
        );

    }


    if (
        periodo === "monthly"
    ) {

        const ano =
            agora.getFullYear();

        const mes =
            agora.getMonth();


        return tarefas.filter(
            (tarefa) => {

                const data =
                    new Date(
                        `${tarefa.data}T00:00:00`
                    );


                return (
                    data.getFullYear() === ano &&
                    data.getMonth() === mes
                );

            }
        );

    }


    return [];

}


function atualizarGraficoConclusao() {

    const lista =
        obterTarefasPeriodo(
            periodoConclusao
        );


    const total =
        lista.length;


    const concluidas =
        lista.filter(
            (tarefa) =>
                tarefa.concluida
        ).length;


    const pendentes =
        total - concluidas;


    const percentual =
        total === 0
            ? 0
            : Math.round(
                (concluidas / total) *
                100
            );


    document.getElementById(
        "completedCount"
    ).textContent =
        concluidas;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pendentes;


    document.getElementById(
        "totalCount"
    ).textContent =
        total;


    document.getElementById(
        "completionPercent"
    ).textContent =
        `${percentual}%`;


    document.getElementById(
        "completionTitle"
    ).textContent =
        periodoConclusao === "daily"
            ? "Hoje"
            : periodoConclusao === "weekly"
                ? "Esta semana"
                : "Este mês";


    const pieChart =
        document.getElementById(
            "completionPie"
        );


    const anguloConclusao = percentual * 3.6;
    const corPendentes = total === 0
        ? "var(--border)"
        : "var(--yellow)";

    pieChart.style.background =
        `conic-gradient(
            var(--blue) 0deg,
            var(--blue) ${anguloConclusao}deg,
            ${corPendentes} ${anguloConclusao}deg,
            ${corPendentes} 360deg
        )`;

    pieChart.setAttribute(
        "aria-label",
        `${concluidas} tarefas concluídas e ${pendentes} pendentes`
    );

}


function atualizarGraficos() {

    atualizarGraficoConclusao();

    atualizarGraficoCarga();

}


/* =========================
   GRÁFICO DE CARGA
========================= */

const workloadButtons =
    document.querySelectorAll(
        ".workload-period"
    );

const workloadChart =
    document.getElementById(
        "workloadChart"
    );


let periodoCarga =
    "day";


workloadButtons.forEach(
    (botao) => {

        botao.addEventListener(
            "click",
            () => {

                workloadButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                botao.classList.add(
                    "active"
                );


                periodoCarga =
                    botao.dataset.workload;


                atualizarGraficoCarga();

            }
        );

    }
);




function atualizarGraficoCarga() {

    workloadChart.replaceChildren();

    const dados = [];

    if (periodoCarga === "day") {
        const horas = obterHorasRotina();

        horas.forEach((hora) => {
            const horaFormatada =
                String(hora).padStart(2, "0");

            const quantidade =
                tarefas.filter(
                    (tarefa) =>
                        tarefa.data === obterDataAtual() &&
                        tarefa.horario.slice(0, 2) === horaFormatada
                ).length;

            dados.push({
                label: `${horaFormatada}h`,
                valor: quantidade
            });
        });
    } else if (periodoCarga === "week") {
        for (let indice = 0; indice < 7; indice++) {
            const dia = adicionarDias(inicioSemana, indice);
            const data = formatarData(dia);
            const quantidade =
                tarefas.filter((tarefa) => tarefa.data === data).length;

            dados.push({
                label: dia.toLocaleDateString("pt-BR", { weekday: "short" }),
                valor: quantidade
            });
        }
    } else {
        const agora = new Date();
        const diasNoMes = new Date(
            agora.getFullYear(),
            agora.getMonth() + 1,
            0
        ).getDate();

        for (let dia = 1; dia <= diasNoMes; dia++) {
            const data = new Date(
                agora.getFullYear(),
                agora.getMonth(),
                dia
            );
            const quantidade =
                tarefas.filter(
                    (tarefa) => tarefa.data === formatarData(data)
                ).length;

            dados.push({ label: dia, valor: quantidade });
        }
    }

    const maior = Math.max(...dados.map((item) => item.valor), 0);
    const escalaMaxima = Math.max(maior, 1);
    const larguraSvg = Math.max(workloadChart.clientWidth, 320);
    const alturaSvg = 300;
    const margens = {
        esquerda: 42,
        direita: 12,
        superior: 24,
        inferior: 42
    };
    const larguraGrafico =
        larguraSvg - margens.esquerda - margens.direita;
    const alturaGrafico =
        alturaSvg - margens.superior - margens.inferior;
    const namespaceSvg = "http://www.w3.org/2000/svg";

    const criarElementoSvg = (nome, atributos = {}, texto = "") => {
        const elemento = document.createElementNS(namespaceSvg, nome);

        Object.entries(atributos).forEach(([atributo, valor]) => {
            elemento.setAttribute(atributo, String(valor));
        });

        elemento.textContent = texto;
        return elemento;
    };

    const nivelCarga = (valor) => {
        const proporcao = valor / escalaMaxima;

        if (proporcao >= 0.7) {
            return "high";
        }

        if (proporcao >= 0.35) {
            return "medium";
        }

        return "low";
    };

    const descricaoPeriodo = {
        day: "por hora",
        week: "por dia da semana",
        month: "por dia do mês"
    }[periodoCarga];

    const svg = criarElementoSvg("svg", {
        viewBox: `0 0 ${larguraSvg} ${alturaSvg}`,
        role: "img",
        "aria-label": `Carga de tarefas ${descricaoPeriodo}`
    });

    const valoresEixo = maior === 0
        ? [0]
        : [...new Set([maior, Math.ceil(maior / 2), 0])];

    valoresEixo.forEach((valorEixo) => {
        const y = margens.superior +
            ((escalaMaxima - valorEixo) / escalaMaxima) * alturaGrafico;

        svg.appendChild(criarElementoSvg("line", {
            x1: margens.esquerda,
            y1: y,
            x2: larguraSvg - margens.direita,
            y2: y,
            class: "workload-grid-line"
        }));

        svg.appendChild(criarElementoSvg("text", {
            x: margens.esquerda - 9,
            y: y + 4,
            class: "workload-axis-label",
            "text-anchor": "end"
        }, String(valorEixo)));
    });

    const pontos = dados.map((item, indice) => {
        const fracaoX = dados.length === 1
            ? 0.5
            : indice / (dados.length - 1);

        return {
            ...item,
            x: margens.esquerda + fracaoX * larguraGrafico,
            y: margens.superior +
                ((escalaMaxima - item.valor) / escalaMaxima) * alturaGrafico
        };
    });

    pontos.forEach((ponto, indice) => {
        if (indice === 0) {
            return;
        }

        const anterior = pontos[indice - 1];
        const intensidade = nivelCarga((anterior.valor + ponto.valor) / 2);

        svg.appendChild(criarElementoSvg("line", {
            x1: anterior.x,
            y1: anterior.y,
            x2: ponto.x,
            y2: ponto.y,
            class: `workload-line-segment workload-${intensidade}`
        }));
    });

    pontos.forEach((ponto, indice) => {
        const intensidade = nivelCarga(ponto.valor);
        const circulo = criarElementoSvg("circle", {
            cx: ponto.x,
            cy: ponto.y,
            r: 5,
            class: `workload-point workload-${intensidade}`
        });

        circulo.appendChild(criarElementoSvg(
            "title",
            {},
            `${ponto.label}: ${ponto.valor} ${ponto.valor === 1 ? "tarefa" : "tarefas"}`
        ));
        svg.appendChild(circulo);

        const mostrarRotulo =
            periodoCarga === "week" ||
            indice === pontos.length - 1 ||
            (periodoCarga === "day" && indice % 2 === 0) ||
            (
                periodoCarga === "month" &&
                (indice === 0 || Number(ponto.label) % 5 === 0)
            );

        if (mostrarRotulo) {
            svg.appendChild(criarElementoSvg("text", {
                x: ponto.x,
                y: alturaSvg - 10,
                class: "workload-axis-label",
                "text-anchor": "middle"
            }, String(ponto.label)));
        }
    });

    workloadChart.appendChild(svg);
}

const workloadChartResizeObserver = new ResizeObserver(() => {
    if (workloadChart.clientWidth > 0) {
        atualizarGraficoCarga();
    }
});

workloadChartResizeObserver.observe(workloadChart);
atualizarGraficoCarga();


/* =========================
   PERFIL
========================= */

const abrirPerfil =
    document.getElementById(
        "abrirPerfil"
    );

const modalPerfil =
    document.getElementById(
        "modalPerfil"
    );

const fecharPerfil =
    document.getElementById(
        "fecharPerfil"
    );

const perfilTab =
    document.getElementById(
        "perfilTab"
    );

const configuracoesTab =
    document.getElementById(
        "configuracoesTab"
    );

const info =
    document.getElementById(
        "info"
    );


function abrirModalPerfil() {

    modalPerfil.classList.add(
        "ativo"
    );

    mostrarPerfil();

}


function fecharModalPerfil() {

    modalPerfil.classList.remove(
        "ativo"
    );

}


function mostrarPerfil() {

    perfilTab.classList.add(
        "active"
    );

    configuracoesTab.classList.remove(
        "active"
    );

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

                    <strong data-profile-name>
                        ${currentProfile.name || "Usuário"}
                    </strong>

                    <p data-profile-email>
                        ${currentProfile.email || ""}
                    </p>

                </div>

            </div>

            <p>
                Nome: <span data-profile-name>${currentProfile.name || "Usuário"}</span>
            </p>

            <p>
                Email: <span data-profile-email>${currentProfile.email || ""}</span>
            </p>

        </div>
    `;

    window.applyUserProfile?.(currentProfile);

}


function mostrarConfiguracoes() {

    configuracoesTab.classList.add(
        "active"
    );

    perfilTab.classList.remove(
        "active"
    );


    const darkMode =
        localStorage.getItem(
            "taskly-dark-mode"
        ) === "true";


    info.innerHTML = `
        <div class="settings-content">

            <h2>
                Configurações
            </h2>

            <div class="setting">

                <span>
                    Modo noturno
                </span>

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
        modoNoturno.addEventListener(
            "change",
            alterarModoNoturno
        );
    }

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            () => {
                if (typeof window.logoutCurrentUser === "function") {
                    window.logoutCurrentUser();
                }
            }
        );
    }

}


function alterarModoNoturno(event) {

    const ativo =
        event.target.checked;


    document.body.classList.toggle(
        "dark-mode",
        ativo
    );


    localStorage.setItem(
        "taskly-dark-mode",
        ativo
            ? "true"
            : "false"
    );

}


abrirPerfil.addEventListener(
    "click",
    abrirModalPerfil
);


fecharPerfil.addEventListener(
    "click",
    fecharModalPerfil
);


modalPerfil.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalPerfil
        ) {

            fecharModalPerfil();

        }

    }
);


perfilTab.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        mostrarPerfil();

    }
);


configuracoesTab.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        mostrarConfiguracoes();

    }
);


/* =========================
   MODO NOTURNO
========================= */

if (
    localStorage.getItem(
        "taskly-dark-mode"
    ) === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );

}


/* =========================
   INICIALIZAÇÃO
========================= */

renderizarCalendario();

atualizarGraficos();

onAuthStateChanged(auth, async (usuario) => {
    const geracaoAtual = ++geracaoDeCarregamento;
    usuarioAtual = usuario;
    tarefas.splice(0, tarefas.length);
    projetosRotina.splice(0, projetosRotina.length);

    renderizarCalendario();
    atualizarGraficos();

    if (!usuario) {
        return;
    }

    try {
        const [snapshotTarefas, projetosAutenticados] = await Promise.all([
            getDocs(collection(db, "users", usuario.uid, "tasks")),
            carregarProjetosDaRotina(usuario)
        ]);

        if (
            geracaoAtual !== geracaoDeCarregamento ||
            usuarioAtual?.uid !== usuario.uid
        ) {
            return;
        }

        snapshotTarefas.forEach((tarefaDoc) => {
            const dados = tarefaDoc.data();

            tarefas.push({
                id: tarefaDoc.id,
                nome: dados.nome,
                data: dados.data,
                horario: dados.horario,
                concluida: dados.concluida
            });
        });

        projetosRotina.push(...projetosAutenticados);
        atualizarListaProjetosDisponiveis();
        renderizarCalendario();
        atualizarGraficos();
    } catch (error) {
        console.error("Não foi possível carregar as tarefas.", error);

        if (geracaoAtual === geracaoDeCarregamento) {
            alert("Não foi possível carregar suas tarefas. Verifique sua conexão e tente novamente.");
        }
    }
});