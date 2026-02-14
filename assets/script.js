document.addEventListener("DOMContentLoaded", () => {

    // 1. Configuración de Google Sheets (URL de exportación JSON)
    const SHEET_ID = "1kXIlcUHinT3hFVhNkGWnevTdXQsVr4iGHd-AAgf-xd4";
    const SHEET_NAME = "Hoja 1"; 
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    let shows = [];

    // 2. Diccionario de traducciones
    const translations = {
        es: {
            "nav-home": " Inicio ",
            "nav-bio": " ¿Quiénes somos? ",
            "nav-shows": " Próximos Shows ",
            "nav-contact": " Contacto ",
            "hero-title": " Beatles One ",
            "hero-sub": " El tributo definitivo a los 4 de Liverpool ",
            "bio-title": " Beatles One - El tributo a The Beatles de origen Uruguayo ",
            "bio-subtitle": " Finalistas de la Beatleweek en The Cavern Club de BS AS - <b>2025</b> ",
            "shows-title": " Próximos Shows ",
            "no-shows-message": "Aún no hay shows programados.",
            "past-shows-title": " Shows Anteriores ",
            "contact-title": " Ponete en contacto ",
            "label-reason": " Motivo: ",
            "opt-show": " Contrataciones ",
            "opt-fan": " Consultas ",
            "opt-other": " Otro ",
            "label-name": " Nombre: ",
            "label-email": " Correo: ",
            "label-msg": " Mensaje: ",
            "btn-send": " Enviar "
        },
        en: {
            "nav-home": " Home ",
            "nav-bio": " About Us ",
            "nav-shows": " Gigs ",
            "nav-contact": " Contact ",
            "hero-title": " Beatles One ",
            "hero-sub": " The ultimate tribute to the Fab Four ",
            "bio-title": " Beatles One - The Uruguayan Beatles Tribute Band ",
            "bio-subtitle": " Finalists of Beatleweek at The Cavern Club in Buenos Aires - <b>2025</b> ",
            "shows-title": " Upcoming Gigs ",
            "no-shows-message": "No upcoming shows scheduled.",
            "past-shows-title": " Past Gigs ",
            "contact-title": " Get in touch ",
            "label-reason": " Reason: ",
            "opt-show": " Booking ",
            "opt-fan": " Inquiries ",
            "opt-other": " Other ",
            "label-name": " Name: ",
            "label-email": " Email: ",
            "label-msg": " Message: ",
            "btn-send": " Send "
        }
    };

    // 3. Lógica de Pestañas
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("main section");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            
            sections.forEach(s => s.classList.remove("active"));
            navLinks.forEach(l => l.classList.remove("active-link"));
            
            document.getElementById(targetId).classList.add("active");
            link.classList.add("active-link");
        });
    });

    // 4. Lógica de Idiomas
    const changeLanguage = (lang) => {
        document.querySelectorAll("[data-section]").forEach(el => {
            const key = el.getAttribute("data-section");
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });
        document.documentElement.lang = lang;
        renderShows(); 
    };

    document.getElementById("btn-es").addEventListener("click", () => changeLanguage("es"));
    document.getElementById("btn-en").addEventListener("click", () => changeLanguage("en"));

    // 5. Cargar shows desde Google Sheets
    const loadShowsFromSheet = async () => {
        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            
            // Limpieza del JSON de Google
            const json = JSON.parse(text.substring(47).slice(0, -2));
            const rows = json.table.rows;
            
            shows = rows.map(row => {
                const cells = row.c;
                if (!cells || !cells[0] || !cells[5] || cells[5].v.toUpperCase() !== "SI") {
                    return null;
                }
                
                let rawDate = cells[0].v;
                let fechaFinal;

                if (typeof rawDate === "string" && rawDate.includes("Date")) {
                    const d = rawDate.match(/\d+/g);
                    // Google Sheets manda meses base 0 (Enero = 0)
                    fechaFinal = new Date(d[0], d[1], d[2]);
                } else {
                    fechaFinal = new Date(rawDate);
                }

                return {
                    fechaObjeto: fechaFinal,
                    fechaTexto: {
                        es: cells[1] ? cells[1].v : "",
                        en: cells[2] ? cells[2].v : ""
                    },
                    lugar: cells[3] ? cells[3].v : "",
                    ciudad: cells[4] ? cells[4].v : ""
                };
            }).filter(show => show !== null);
            
            renderShows();
            
        } catch (error) {
            console.error("Error al cargar shows:", error);
        }
    };

    // 6. Renderizar Shows
    const renderShows = () => {
        const listaProximos = document.querySelector("#lista-shows-proximos");
        const listaPasados = document.querySelector("#lista-shows-pasados");
        
        if (!listaProximos || !listaPasados) return;

        listaProximos.innerHTML = "";
        listaPasados.innerHTML = "";

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const idiomaActual = document.documentElement.lang || "es";

        const proximos = shows.filter(s => s.fechaObjeto >= hoy);
        const pasados = shows.filter(s => s.fechaObjeto < hoy);

        proximos.sort((a, b) => a.fechaObjeto - b.fechaObjeto);
        pasados.sort((a, b) => b.fechaObjeto - a.fechaObjeto);

const crearLi = (show, esPasado) => {
    const li = document.createElement("li");
    const idiomaActual = document.documentElement.lang || "es";
    
    // Variables de fecha (Automáticas y prolijas)
    const dayName = new Intl.DateTimeFormat(idiomaActual, { weekday: 'short' }).format(show.fechaObjeto);
    const dayNum = new Intl.DateTimeFormat(idiomaActual, { day: '2-digit' }).format(show.fechaObjeto);
    const monthName = new Intl.DateTimeFormat(idiomaActual, { month: 'short' }).format(show.fechaObjeto);

    // Lógica de "Evento Privado"
    const esEventoPrivado = show.lugar.toUpperCase().includes("EVENTO PRIVADO");

    li.classList.add("show-card");
    if (esPasado) li.classList.add("pasado");

    // Construimos el HTML respetando tus clases de CSS originales
    li.innerHTML = `
        <div class="show-date-box">
            <span>${dayName.replace('.', '').toUpperCase()}</span>
            <span class="date-day-num">${dayNum}</span>
            <span>${monthName.replace('.', '').toUpperCase()}</span>
        </div>

        <div class="show-content">
            <div class="show-venue">${show.lugar}</div>
            <div class="show-city">${show.ciudad}</div>
        </div>

        <div class="show-actions">
            ${esPasado 
                ? `` 
                : (esEventoPrivado 
                    ? "" 
                    : `<a href="#" class="btn-ticket">${idiomaActual === "es" ? "RESERVAR" : "TICKETS"}</a>`
                  )
            }
        </div>
    `;

    return li;
};

        if (proximos.length === 0) {
            listaProximos.innerHTML = `<li>${translations[idiomaActual]["no-shows-message"]}</li>`;
        } else {
            proximos.forEach(s => listaProximos.appendChild(crearLi(s, false)));
        }

        pasados.forEach(s => listaPasados.appendChild(crearLi(s, true)));
    };

    // Click en logo vuelve a Inicio
    const logoLink = document.getElementById("logo-link");
    if (logoLink) {
        logoLink.addEventListener("click", (e) => {
            e.preventDefault();
            const inicioLink = document.querySelector('nav a[href="#inicio"]');
            if (inicioLink) inicioLink.click();
        });
    }

    // 7. Inicialización
    loadShowsFromSheet();
    
    const homeLink = document.querySelector('nav a[href="#inicio"]');
    if (homeLink) homeLink.classList.add("active-link");
});