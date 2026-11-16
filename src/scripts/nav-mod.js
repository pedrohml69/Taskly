/* =========================================================
   COMPONENTES COMPARTILHADOS
========================================================= */


/* =========================================================
   NAVBAR
========================================================= */

function criarNavbar() {

    const paginaAtual =
        window.location.pathname
            .split("/")
            .pop();


    const dashboardAtivo =
        paginaAtual === "dashboard.html";

    const boardAtivo =
        paginaAtual === "board.html";


    const navbar = document.createElement("nav");

    navbar.innerHTML = `

        <div class="logo-links">

            <div class="logo">

                <h1>
                    Taskly
                </h1>

            </div>


            <button
                class="menu-button"
                id="menuButton"
                type="button"
            >
                ☰
            </button>


            <div class="links">

                <a
                    href="../pages/dashboard.html"
                    class="${dashboardAtivo ? "active" : ""}"
                >
                    Dashboard
                </a>


                <a
                    href="../pages/board.html"
                    class="${boardAtivo ? "active" : ""}"
                >
                    Board
                </a>

            </div>

        </div>


        <div
            class="account"
            id="abrirPerfil"
        >

            <div class="user"></div>

            <p data-profile-name>
                Usuário
            </p>

        </div>

    `;


    document.body.prepend(navbar);

}


/* =========================================================
   MODAL PERFIL
========================================================= */

function criarModalPerfil() {

    const modal =
        document.createElement("div");


    modal.className =
        "modal-overlay";


    modal.id =
        "modalPerfil";


    modal.innerHTML = `

        <div class="modal">

            <button
                class="fechar-modal"
                id="fecharPerfil"
                type="button"
            >
                &times;
            </button>


            <div class="mod-side-bar">

                <a
                    href="#"
                    class="active"
                    id="perfilTab"
                >
                    Perfil
                </a>


                <a
                    href="#"
                    id="configuracoesTab"
                >
                    Configurações
                </a>

            </div>


            <div
                class="info"
                id="info"
            ></div>

        </div>

    `;


    document.body.appendChild(modal);

}

window.currentUserProfile = {
    name: "Usuário",
    email: ""
};

window.applyUserProfile = function (profile) {
    const name =
        typeof profile?.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : "Usuário";

    const email =
        typeof profile?.email === "string"
            ? profile.email
            : "";

    window.currentUserProfile = { name, email };

    document.querySelectorAll("[data-profile-name]").forEach((element) => {
        element.textContent = name;
    });

    document.querySelectorAll("[data-profile-email]").forEach((element) => {
        element.textContent = email;
    });
};


/* =========================================================
   ABRIR / FECHAR MODAL
========================================================= */

function abrirModalPerfil() {

    const modalPerfil =
        document.getElementById(
            "modalPerfil"
        );


    modalPerfil.classList.add(
        "ativo"
    );


    mostrarPerfil();

}


function fecharModalPerfil() {

    const modalPerfil =
        document.getElementById(
            "modalPerfil"
        );


    modalPerfil.classList.remove(
        "ativo"
    );

}


/* =========================================================
   PERFIL
========================================================= */

function mostrarPerfil() {

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


    perfilTab.classList.add(
        "active"
    );


    configuracoesTab.classList.remove(
        "active"
    );


    info.innerHTML = `

        <div class="profile-content">

            <h2>
                Perfil
            </h2>


            <div class="profile-user">

                <div class="user"></div>


                <div>

                    <strong data-profile-name>
                        Usuário
                    </strong>

                    <p data-profile-email></p>

                </div>

            </div>


            <p>
                Nome: <span data-profile-name>Usuário</span>
            </p>


            <p>
                Email: <span data-profile-email></span>
            </p>

        </div>

    `;

    window.applyUserProfile(window.currentUserProfile);

}


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

function mostrarConfiguracoes() {

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


            <div class="setting">

                <span>
                    Notificações
                </span>


                <label class="switch">

                    <input
                        type="checkbox"
                        checked
                    >

                    <span class="slider"></span>

                </label>

            </div>

        </div>

    `;


    document
        .getElementById("modoNoturno")
        .addEventListener(
            "change",
            alterarModoNoturno
        );

}


/* =========================================================
   MODO NOTURNO
========================================================= */

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


/* =========================================================
   MENU MOBILE
========================================================= */

function configurarMenuMobile() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const links =
        document.querySelector(
            ".links"
        );


    if (
        !menuButton ||
        !links
    ) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            links.classList.toggle(
                "menu-open"
            );

        }
    );

}


/* =========================================================
   CONFIGURAR EVENTOS DO MODAL
========================================================= */

function configurarModalPerfil() {

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

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

criarNavbar();

criarModalPerfil();

configurarMenuMobile();

configurarModalPerfil();


/* =========================================================
   CARREGAR MODO NOTURNO
========================================================= */

if (
    localStorage.getItem(
        "taskly-dark-mode"
    ) === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );

}