(() => {
  "use strict";

  const widget = document.querySelector("[data-emc-chat]");
  if (!widget) return;
  const panel = widget.querySelector("dialog");
  if (typeof panel.showModal !== "function") return;

  const launcher = widget.querySelector(".chat-launcher");
  const mobile = window.matchMedia("(max-width: 46rem)");
  const viewport = window.visualViewport;
  const noticeKey = "emc-chat-aviso-v1";
  const terms = "./images/legal-documents/EMC_Terminos_y_Condiciones_ES.pdf";
  const privacy = "./images/legal-documents/EMC_Politica_de_Privacidad_Espanol.pdf";

  panel.innerHTML = `
    <header class="chat-header">
      <h2 id="chat-title">Pregúntale a EMC</h2>
      <button class="chat-close" type="button" aria-label="Cerrar chat" autofocus>×</button>
    </header>
    <section class="chat-notice" aria-labelledby="chat-notice-title">
      <h3 id="chat-notice-title">Antes de empezar</h3>
      <ul class="chat-notice-list">
        <li>Este asistente automatizado ofrece información general. Sus respuestas no constituyen asesoramiento de inversión. Invertir implica riesgos, incluida la pérdida del capital.</li>
        <li>Este chat es para personas de 18 años o más. Evita compartir contraseñas, códigos o datos de tu cuenta.</li>
      </ul>
      <p class="chat-legal-links">
        Consulta los <a href="${terms}" target="_blank" rel="noopener">Términos y condiciones</a>
        y la <a href="${privacy}" target="_blank" rel="noopener">Política de privacidad</a> de EMC.
      </p>
      <button class="chat-continue" type="button">Entendido, continuar</button>
    </section>
    <section class="chat-conversation" aria-label="Chat" hidden>
      <div class="chat-scroll">
        <div class="chat-intro">
          <h3 tabindex="-1">¿En qué te puedo ayudar?</h3>
          <div class="chat-topics" role="group" aria-label="Preguntas sugeridas">
            <button type="button" data-topic="openAccount">¿Cómo me registro?</button>
            <button type="button" data-topic="plans">¿Cuánto cuesta la membresía?</button>
            <button type="button" data-topic="deposit">¿Cómo hago un depósito?</button>
          </div>
        </div>
        <div class="chat-thread" role="log" aria-label="Conversación" aria-live="polite" tabindex="-1"></div>
      </div>
      <div class="chat-composer">
        <form class="chat-form">
          <label class="chat-sr" for="chat-question">Escribe tu pregunta</label>
          <input id="chat-question" name="question" type="text" placeholder="Escribe tu pregunta" maxlength="300" autocomplete="off" enterkeyhint="send" required>
          <button type="submit" aria-label="Enviar pregunta" disabled><span aria-hidden="true">↑</span></button>
        </form>
        <p class="chat-note">Información general. Invertir implica riesgos. <a href="${terms}" target="_blank" rel="noopener">Ver términos</a></p>
      </div>
    </section>`;

  const notice = panel.querySelector(".chat-notice");
  const conversation = panel.querySelector(".chat-conversation");
  const intro = panel.querySelector(".chat-intro");
  const scroll = panel.querySelector(".chat-scroll");
  const thread = panel.querySelector(".chat-thread");
  const form = panel.querySelector("form");
  const input = form.elements.question;
  const send = form.querySelector("button");
  let acknowledged = false;
  try {
    acknowledged = sessionStorage.getItem(noticeKey) === "1";
  } catch {
    // Keep the acknowledgement in this page if browser storage is unavailable.
  }

  const helpPage = "./ayuda.html";
  let helpRequest;

  const app = "https://app.elmenudocuenta.com";
  const loginLink = ["Ingresar a la app", app + "/users/log_in"];
  const supportLinks = [
    ["WhatsApp de soporte", "https://wa.me/message/P5RVRV7B3XENP1"],
    ["Correo de soporte", "mailto:tech@elmenudocuenta.com"]
  ];
  const helpLink = (label, topic) => [label, "./ayuda.html?tema=" + topic + "#preguntas"];

  const answers = {
    support: ["El equipo de soporte puede ayudarte a revisar lo que ocurre con tu cuenta. Puedes escribirle por WhatsApp o correo.", supportLinks],
    account: ["Las consultas sobre saldos, solicitudes u operaciones específicas se revisan en la app o con soporte.", [loginLink, ...supportLinks]],
    phone: ["Durante el registro, confirma tu número ingresando el código que recibas en tu celular. Si no recibes el código, contacta a soporte.", [helpLink("Ver ayuda de acceso", "acceso"), ...supportLinks]],
    login: ["Entra a la app de El Menudo Cuenta para ingresar. En el Centro de Ayuda también encontrarás opciones para recuperar el acceso.", [loginLink, helpLink("Ver ayuda de acceso", "acceso")]],
    custody: ["El Menudo Cuenta administra la estrategia. Interactive Brokers actúa como corredor y custodio: ejecuta las operaciones y custodia los activos.", [["Ver documentos legales", "./legal.html#divulgaciones"]]],
    legal: ["La página Legal reúne el Form CRS, el Form ADV, las tarifas, los acuerdos y las políticas en español e inglés.", [["Ir a Legal", "./legal.html"]]],
    personalized: ["Puedo explicarte cómo funciona el servicio y compartir materiales educativos. Para revisar el perfil que completaste y la estrategia que EMC te propone, entra a la app.", [loginLink, ["Ir a Aprende", "./aprende.html"]]],
    unknown: ["No encontré una respuesta para esa consulta. Puedes buscar en el Centro de Ayuda o escribir al equipo de soporte.", [["Buscar en el Centro de Ayuda", "./ayuda.html#preguntas"], ...supportLinks]]
  };

  const actionIntents = [
    [/\b(?:recomiend\w*|mejor)\b.*\b(?:invertir|comprar|vender|accion|etf|cartera|portafolio)\b|(?:debo|deberia) (?:invertir|comprar|vender)|\b(?:que|cual) (?:accion|etf|portafolio|cartera) (?:compro|elijo|me conviene)|cuanto (?:debo|deberia) invertir|\b(?:me conviene|me aconsejas|que me recomiendas)\b/, "personalized"],
    [/\b(?:soporte|whatsapp|agente|asesor humano|reclamo)\b|(?:correo|email) (?:de|del|para) (?:soporte|contacto)|hablar con (?:una persona|alguien)/, "support"],
    [/(?:pendiente|rechaz\w*|fall\w*|no aparece|no llega|no se refleja|estado de)\b.*\b(?:solicitud|deposito|retiro|transferencia|cuenta)\b|\b(?:solicitud|deposito|retiro|transferencia|cuenta)\b.*\b(?:pendiente|rechaz\w*|fall\w*|no aparece|no llega|no se refleja)|\b(?:mi saldo|mis movimientos|retirar dinero|retiro de fondos)\b/, "account"],
    [/\b(?:verific\w*|confirm\w*|codigo)\b.*\b(?:telefono|celular|sms|cuenta)\b|(?:no (?:recibo|llega)|no me llega).*(?:codigo|sms)/, "phone"],
    [/\b(?:crs|adv|divulgaciones?|privacidad|condiciones|acuerdo del cliente)\b/, "legal"],
    [/\b(?:custodio|custodia|ibkr|broker|corredor)\b|interactive brokers|seguro.*dinero|dinero.*seguro/, "custody"],
    [/\b(?:ingresar|entrar|inicio de sesion|login|contrasena)\b|inici(?:ar|o) sesion/, "login"],
  ];

  const faqIntents = [
    [/\b(?:fuera (?:de|del) (?:los )?(?:ee\s*\.?\s*uu|estados unidos|usa|pais)|en el extranjero|desde el extranjero|desde otro pais|sin (?:residencia|ciudadania))\b/, "availability"],
    [/\b(?:pued[eo]n?|podria|disponible|aceptan|registr\w*|abrir)\b.*\b(?:vivo|vive|resid\w*|estados unidos|ee\s*\.?\s*uu|usa|puerto rico)\b|\b(?:vivo|vive|resido|reside)\b.*\b(?:pued[eo]n?|podria|abrir|registr\w*)\b/, "availability"],
    [/\b(?:abrir (?:una |mi |la )?cuenta|registr\w*|disponible)\b.*\bdesde\b(?!\s+(?:la app|mi (?:telefono|celular)|el navegador|mi computadora)\b)/, "availability"],
    [/\b(?:olvid\w*|restablec\w*|recuper\w*|cambi\w*)\b.*\b(?:clave|contrasena)\b|\b(?:clave|contrasena)\b.*\b(?:olvid\w*|restablec\w*|recuper\w*|cambi\w*)\b/, "password"],
    [/\b(?:program\w*|automatiz\w*|automatic[oa]s?|recurrentes?)\b.*\b(?:depositos?|aportes?|aportaciones?)\b|\b(?:depositos?|aportes?|aportaciones?)\b.*\b(?:automatic[oa]s?|recurrentes?)\b/, "recurring"],
    [/\b(?:requisit\w*|quien(?:es)? pued[eo]n?|edad|itin|seguro social|ssn|documentos?)\b.*\b(?:abrir|cuenta|registr\w*|necesit\w*)\b|\b(?:aceptan|piden|necesito)\b.*\b(?:itin|ssn|seguro social)\b/, "eligibility"],
    [/\b(?:olvide|olvidado|recuper\w*)\b.*\b(?:mi usuario|nombre de usuario)\b/, "username"],
    [/\bmicrodepositos?\b/, "micro"],
    [/\b(?:bancari\w*|banco)\b.*\b(?:rechaz\w*|no puedo|error)\b|\b(?:no puedo|error al)\b.*\b(?:conect\w*|vincul\w*|agreg\w*)\b.*\b(?:banco|bancaria)\b/, "bankError"],
    [/\b(?:conect\w*|vincul\w*|agreg\w*)\b.*\b(?:banco|cuenta bancaria)\b/, "bank"],
    [/\bdepositos?\b.*\brechaz\w*\b|\brechaz\w*\b.*\bdepositos?\b/, "depositRejected"],
    [/\b(?:tard\w*|demor\w*|cuanto tiempo|cuantos dias)\b.*\b(?:deposit\w*|ach)\b|\b(?:deposit\w*|ach)\b.*\b(?:tard\w*|demor\w*|cuanto tiempo|cuantos dias)\b/, "depositTime"],
    [/\b(?:primer deposito|(?:como|donde) (?:puedo )?(?:depositar|hacer (?:mi |un )?deposito)|como hago (?:mi |un )?deposito)\b/, "deposit"],
    [/\b(?:cuando|una vez)\b.*\bdeposito\b.*\bdisponible\b/, "funds"],
    [/\b(?:membresias?|suscripciones?)\b.*\b(?:precio|cuesta|planes|opciones|cuanto|incluye|ver)\b|\b(?:cuanto cuesta|cuales son|ver|comparar)\b.*\b(?:planes|membresias?|suscripciones?)\b/, "plans"],
    [/\b(?:cuanto|minimo|minima)\b.*\b(?:empezar|comenzar|abrir una cuenta|invertir)\b/, "start"],
    [/\b(?:que es|que significa|como funciona)\b.*\b(?:mc futuro|cuenta futuro|futuro)\b/, "retirement"],
    [/\b(?:que es|que significa|como funciona)\b.*\b(?:mc inversiones|cuenta de inversiones|inversiones)\b/, "investing"],
    [/\b(?:cuantas|cuales|que) (?:son las |son los )?(?:carteras|portafolios)\b.*\b(?:ofrecen|tienen|disponibles|inversion)\b/, "portfolios"],
    [/\b(?:sipc|aseguradas?|asegurados?)\b.*\b(?:inversiones?|activos?|cuentas?)\b|\b(?:inversiones?|activos?)\b.*\b(?:sipc|aseguradas?|asegurados?)\b/, "insurance"],
    [/\b(?:hay|existe|que)\b.*\briesgos?\b.*\b(?:invertir|inversion)\b/, "risks"],
    [/\b(?:como (?:puedo )?verific\w* (?:mi |la )?cuenta|verific\w* mi (?:registro|identidad))\b/, "verifiedAccount"],
    [/\b(?:como|donde)\b.*\b(?:abro|abrir)\b.*\bcuenta de inversion\b/, "openAccount"],
    [/\b(?:como|donde)\b.*\b(?:registr\w*|(?:abrir|abro|crear|creo) (?:una |mi |la )?cuenta)\b/, "openAccount"]
  ];

  const stopWords = new Set("a al algun alguna algo cada como con cuando cual cuales de del donde el ella ellas ellos en es esa ese esta estas este esto estos hago hay la las le lo los me mc emc mi mis para pasa puedo puede pueden por que quien se ser si sin su sus te tengo tu tus un una unos unas ver ya".split(" "));
  const synonyms = new Map([
    ["app", "aplicacion"], ["abro", "abrir"], ["abre", "abrir"],
    ["crear", "abrir"], ["creo", "abrir"], ["vincular", "conectar"],
    ["vinculo", "conectar"], ["conecto", "conectar"],
    ["depositar", "deposito"], ["depositos", "deposito"],
    ["demora", "tarda"], ["demoran", "tarda"], ["tardan", "tarda"],
    ["recurrente", "automatico"], ["recurrentes", "automatico"], ["automaticos", "automatico"],
    ["clave", "contrasena"], ["restablezco", "restablecer"], ["recuperar", "restablecer"],
    ["cartera", "portafolio"], ["carteras", "portafolio"], ["portafolios", "portafolio"]
  ]);

  const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const words = (value) => normalize(value).match(/[a-z0-9]+/g) || [];

  function keywords(value) {
    return new Set(words(value).filter((word) => !stopWords.has(word)).map((word) => synonyms.get(word) || word));
  }

  function findQuestion(faq, question, topic) {
    const phrase = words(question).join(" ");
    const exact = faq.find((entry) => entry.phrase === phrase);
    if (exact) return exact;

    const direct = topic && faq.find((entry) => entry.key === topic);
    if (direct) return direct;

    const terms = keywords(question);
    if (terms.size < 2) return undefined;

    const ranked = faq.flatMap((entry) => {
      const shared = Array.from(terms).filter((word) => entry.terms.has(word)).length;
      if (shared < 2 || shared / terms.size < .65 || shared / entry.terms.size < .65) return [];
      return [{ entry, score: 2 * shared / (terms.size + entry.terms.size) }];
    }).sort((a, b) => b.score - a.score);
    const [first, second] = ranked;
    if (first && (!second || first.score - second.score >= .12)) return first.entry;
  }

  function appendQuestion(question, text, links) {
    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = question;
    const reply = document.createElement("p");
    reply.className = "chat-answer";
    writeReply(reply, text, links);
    if (intro.contains(document.activeElement)) thread.focus({ preventScroll: true });
    intro.hidden = true;
    thread.append(message, reply);
    scroll.scrollTop = scroll.scrollHeight;
    return reply;
  }

  function writeReply(reply, text, links) {
    reply.textContent = text;
    if (links.length) {
      const actions = document.createElement("span");
      actions.className = "chat-answer-actions";
      for (const [label, href] of links) {
        const anchor = document.createElement("a");
        anchor.textContent = label;
        anchor.href = href;
        actions.append(anchor);
      }
      reply.append(actions);
    }
  }

  async function loadHelp() {
    const response = await fetch(helpPage);
    if (!response.ok) throw new Error("El Centro de Ayuda no está disponible");
    const template = document.createElement("template");
    template.innerHTML = await response.text();
    const entries = Array.from(template.content.querySelectorAll(".help-topic details[id]"), (detail) => {
      const title = detail.querySelector("summary").textContent.trim();
      const paragraphs = detail.querySelectorAll(".help-answer p");
      const indices = (detail.dataset.chatExcerpt || "1").split(",");
      const excerpt = detail.hasAttribute("data-chat-link-only") ? "" : indices
        .map((index) => paragraphs[Number(index) - 1]?.textContent.replace(/\s+/g, " ").trim())
        .filter(Boolean).join(" ");
      const topic = detail.closest(".help-topic").dataset.topic;
      return {
        title, phrase: words(title).join(" "), terms: keywords(title),
        text: excerpt.length <= 520 ? excerpt : "",
        key: detail.dataset.chatKey,
        url: helpPage + "?tema=" + encodeURIComponent(topic) + "#" + encodeURIComponent(detail.id)
      };
    });
    if (!entries.length) throw new Error("No hay preguntas disponibles");
    return entries;
  }

  function followUp(topic) {
    if (topic === "plans") return [["Comparar planes y precios", "./membresia.html"]];
    if (topic === "openAccount" || topic === "register") return [["Crear mi usuario", app + "/register"]];
    if (topic === "password") return [loginLink];
    if (topic === "depositRejected" || topic === "bankError" || topic === "username") return supportLinks;
    return [];
  }

  async function answerFromHelp(question, topic, fallback) {
    const reply = appendQuestion(question, "Consultando el Centro de Ayuda…", []);
    clearInput();
    helpRequest ??= loadHelp();
    try {
      const faq = await helpRequest;
      const match = findQuestion(faq, question, topic);
      if (match) {
        const text = match.text || "Encontré esta pregunta en Ayuda: " + match.title;
        const links = [["Ver respuesta en Ayuda", match.url], ...followUp(match.key)];
        writeReply(reply, text, links);
      } else {
        writeReply(reply, ...answers[fallback || "unknown"]);
      }
    } catch {
      helpRequest = undefined;
      writeReply(reply, "No pude consultar el Centro de Ayuda en este momento.", [["Abrir Ayuda", helpPage], ...supportLinks]);
    }
    if (reply === thread.lastElementChild) scroll.scrollTop = scroll.scrollHeight;
  }

  function clearInput() {
    input.value = "";
    send.disabled = true;
  }

  function updateViewport() {
    if (!viewport || !panel.open) return;
    panel.style.setProperty("--chat-height", viewport.height + "px");
    panel.style.setProperty("--chat-top", viewport.offsetTop + "px");
    scroll.scrollTop = scroll.scrollHeight;
  }

  launcher.addEventListener("click", () => {
    if (!mobile.matches) return;
    notice.hidden = acknowledged;
    conversation.hidden = !acknowledged;
    panel.showModal();
    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
  });

  panel.querySelector(".chat-continue").addEventListener("click", () => {
    acknowledged = true;
    try {
      sessionStorage.setItem(noticeKey, "1");
    } catch {
      // The conversation remains available until the page is left.
    }
    notice.hidden = true;
    conversation.hidden = false;
    intro.querySelector("h3").focus();
  });
  panel.querySelector(".chat-close").addEventListener("click", () => panel.close());
  panel.addEventListener("close", () => {
    viewport?.removeEventListener("resize", updateViewport);
    viewport?.removeEventListener("scroll", updateViewport);
    if (mobile.matches) launcher.focus();
  });
  mobile.addEventListener("change", () => {
    if (!mobile.matches && panel.open) panel.close();
  });
  input.addEventListener("input", () => {
    send.disabled = !input.value.trim();
  });

  panel.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => answerFromHelp(button.textContent.trim(), button.dataset.topic));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const normalized = normalize(question);
    if (/\b\d{3}-\d{2}-\d{4}\b|\b\d{9,}\b|[^\s@]+@[^\s@]+\.[^\s@]+|(?:clave|contrasena|ssn|(?:mi )?codigo(?: de verificacion)?)\s*[:=]|(?:mi codigo es|codigo de verificacion)\s+\d{4,8}\b/.test(normalized)) {
      appendQuestion("Pregunta con datos personales", "Por seguridad, evita compartir datos personales aquí. Si necesitas ayuda con tu cuenta, contacta a soporte.", supportLinks);
      clearInput();
      return;
    }
    const action = actionIntents.find(([pattern]) => pattern.test(normalized))?.[1];
    if (action === "personalized" || action === "support") {
      appendQuestion(question, ...answers[action]);
      clearInput();
      return;
    }

    const topic = faqIntents.find(([pattern]) => pattern.test(normalized))?.[1];
    answerFromHelp(question, topic, action);
  });

  widget.hidden = false;
})();
