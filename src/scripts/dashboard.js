import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
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

    for (
        let hora = 4;
        hora <= 23;
        hora++
    ) {

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

        time.textContent =
            `${String(hora).padStart(2, "0")}:00`;


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
                formatarData(dia);


            const horaFormatada =
                `${String(hora).padStart(2, "0")}:00`;


            const tarefasDoHorario =
                tarefas.filter(
                    (tarefa) =>
                        tarefa.data === data &&
                        tarefa.horario.slice(0, 2) === horaFormatada.slice(0, 2)
                ).sort(
                    (primeira, segunda) =>
                        primeira.horario.localeCompare(segunda.horario)
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

    }

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
        for (let hora = 4; hora <= 23; hora++) {
            const horaFormatada =
                String(hora).padStart(2, "0");

            const quantidade =
                tarefas.filter(
                    (tarefa) =>
                        tarefa.data === obterDataAtual() &&
                        tarefa.horario.slice(0, 2) === horaFormatada
                ).length;

            dados.push({
                label: `${hora}h`,
                valor: quantidade
            });
        }
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

                    <strong>
                        ${currentProfile.name || "Usuário"}
                    </strong>

                    <p>
                        ${currentProfile.email || ""}
                    </p>

                </div>

            </div>

            <p>
                Nome: ${currentProfile.name || "Usuário"}
            </p>

            <p>
                Email: ${currentProfile.email || ""}
            </p>

        </div>
    `;

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

    renderizarCalendario();
    atualizarGraficos();

    if (!usuario) {
        return;
    }

    try {
        const snapshot = await getDocs(
            collection(db, "users", usuario.uid, "tasks")
        );

        if (
            geracaoAtual !== geracaoDeCarregamento ||
            usuarioAtual?.uid !== usuario.uid
        ) {
            return;
        }

        snapshot.forEach((tarefaDoc) => {
            const dados = tarefaDoc.data();

            tarefas.push({
                id: tarefaDoc.id,
                nome: dados.nome,
                data: dados.data,
                horario: dados.horario,
                concluida: dados.concluida
            });
        });

        renderizarCalendario();
        atualizarGraficos();
    } catch (error) {
        console.error("Não foi possível carregar as tarefas.", error);

        if (geracaoAtual === geracaoDeCarregamento) {
            alert("Não foi possível carregar suas tarefas. Verifique sua conexão e tente novamente.");
        }
    }
});