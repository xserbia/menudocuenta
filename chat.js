(() => {
  "use strict";

  const widget = document.querySelector("[data-emc-chat]");
  if (!widget) return;
  const panel = widget.querySelector("dialog");
  if (typeof panel.showModal !== "function") return;

  const launcher = widget.querySelector(".chat-launcher");
  const thread = panel.querySelector(".chat-thread");
  const form = panel.querySelector("form");
  const input = form.elements.question;
  const app = "https://app.elmenudocuenta.com";
  const loginLink = ["Ingresar a la app", app + "/users/log_in"];
  const supportLinks = [
    ["WhatsApp de soporte", "https://wa.me/message/P5RVRV7B3XENP1"],
    ["Correo de soporte", "mailto:tech@elmenudocuenta.com"]
  ];
  const helpLink = (label, topic) => [label, "./ayuda.html?tema=" + topic + "#preguntas"];

  const answers = {
    start: ["Puedes empezar a invertir con tan solo $5. Se aplican tarifas de suscripción según la membresía que elijas.", [["Ver membresías", "./membresia.html"]]],
    investing: ["MC Inversiones es una cuenta individual para invertir en un portafolio según tu objetivo, plazo y tolerancia al riesgo.", [helpLink("Ver preguntas sobre Inversiones", "inversiones")]],
    retirement: ["MC Futuro ofrece cuentas individuales para el retiro, como la IRA Tradicional y la Roth IRA.", [helpLink("Ver preguntas sobre Futuro", "futuro")]],
    plans: ["EMC ofrece las membresías Básico y Premium. En la página de Membresía puedes comparar qué incluye cada plan y consultar sus precios mensuales y anuales.", [["Comparar membresías", "./membresia.html"]]],
    support: ["El equipo de soporte puede ayudarte a revisar lo que ocurre con tu cuenta. Puedes escribirle por WhatsApp o correo.", supportLinks],
    account: ["Las consultas sobre saldos, solicitudes u operaciones específicas se revisan en la app o con soporte.", [loginLink, ...supportLinks]],
    register: ["Crea tu usuario con tu correo y contraseña, verifica tu teléfono y elige tu membresía. Luego puedes completar la solicitud de tu cuenta de corretaje.", [["Crear mi usuario", app + "/register"], ["Ver los pasos", "./como-funciona.html"]]],
    phone: ["Durante el registro, confirma tu número ingresando el código que recibas en tu celular. Si no recibes el código, contacta a soporte.", [helpLink("Ver ayuda de acceso", "acceso"), ...supportLinks]],
    login: ["Entra a la app de El Menudo Cuenta para ingresar. En el Centro de Ayuda también encontrarás opciones para recuperar el acceso.", [loginLink, helpLink("Ver ayuda de acceso", "acceso")]],
    password: ["Desde la pantalla de inicio de sesión, selecciona «¿Olvidaste tu contraseña?» y sigue las instrucciones para restablecerla.", [loginLink, helpLink("Ver ayuda de acceso", "acceso")]],
    deposit: ["Una vez aprobada tu cuenta de corretaje, puedes conectar tu banco y hacer el primer depósito desde la app. En Ayuda están los pasos y las preguntas sobre verificación bancaria.", [helpLink("Ver ayuda sobre depósitos", "depositos")]],
    recurring: ["Puedes programar aportaciones recurrentes desde la app. Consulta la guía de depósitos para ver cómo configurarlas.", [helpLink("Ver ayuda sobre depósitos", "depositos")]],
    custody: ["El Menudo Cuenta administra la estrategia. Interactive Brokers actúa como corredor y custodio: ejecuta las operaciones y custodia los activos.", [["Ver documentos legales", "./legal.html#divulgaciones"]]],
    portfolio: ["El Menudo Cuenta propone un portafolio según los objetivos, el plazo y la tolerancia al riesgo que indicas en la app.", [["Ver cómo EMC administra tu portafolio", "./index.html#como-funciona"]]],
    education: ["En Aprende encontrarás videos y cursos en español sobre ahorro e inversión.", [["Ir a Aprende", "./aprende.html"]]],
    risks: ["Invertir implica riesgos, incluida la posible pérdida del capital invertido. Consulta las divulgaciones de EMC para más detalles.", [["Ver documentos legales", "./legal.html#divulgaciones"]]],
    legal: ["La página Legal reúne el Form CRS, el Form ADV, las tarifas, los acuerdos y las políticas en español e inglés.", [["Ir a Legal", "./legal.html"]]],
    personalized: ["Puedo explicarte cómo funciona el servicio y compartir materiales educativos. Para revisar el perfil que completaste y la estrategia que EMC te propone, entra a la app.", [loginLink, ["Ir a Aprende", "./aprende.html"]]],
    unknown: ["No encontré una respuesta para esa consulta. Puedes buscar en el Centro de Ayuda o escribir al equipo de soporte.", [["Buscar en el Centro de Ayuda", "./ayuda.html#preguntas"], ...supportLinks]]
  };

  const intents = [
    [/\b(?:recomiend\w*|mejor)\b.*\b(?:invertir|comprar|vender|accion|etf|cartera|portafolio)\b|(?:debo|deberia) (?:invertir|comprar|vender)|\b(?:que|cual) (?:accion|etf|portafolio|cartera) (?:compro|elijo|me conviene)|cuanto (?:debo|deberia) invertir|\b(?:me conviene|me aconsejas|que me recomiendas)\b/, "personalized"],
    [/\b(?:soporte|whatsapp|agente|asesor humano|reclamo)\b|(?:correo|email) (?:de|del|para) (?:soporte|contacto)|hablar con (?:una persona|alguien)/, "support"],
    [/\b(?:olvid\w*|restablec\w*|recuper\w*|cambi\w*)\b.*\b(?:clave|contrasena)\b|\b(?:clave|contrasena)\b.*\b(?:olvid\w*|restablec\w*|recuper\w*|cambi\w*)\b/, "password"],
    [/(?:pendiente|rechaz\w*|fall\w*|no aparece|no llega|no se refleja|estado de)\b.*\b(?:solicitud|deposito|retiro|transferencia|cuenta)\b|\b(?:solicitud|deposito|retiro|transferencia|cuenta)\b.*\b(?:pendiente|rechaz\w*|fall\w*|no aparece|no llega|no se refleja)|\b(?:mi saldo|mis movimientos|retirar dinero|retiro de fondos)\b/, "account"],
    [/\b(?:verific\w*|confirm\w*|codigo)\b.*\b(?:telefono|celular|sms|cuenta)\b|(?:no (?:recibo|llega)|no me llega).*(?:codigo|sms)/, "phone"],
    [/\b(?:crs|adv|divulgaciones?|privacidad|condiciones|acuerdo del cliente)\b/, "legal"],
    [/\b(?:fdic|riesgos?|perder|perdida|garantia|sipc)\b/, "risks"],
    [/\b(?:custodio|custodia|ibkr|broker|corredor)\b|interactive brokers|seguro.*dinero|dinero.*seguro/, "custody"],
    [/\b(?:program\w*|automatic[oa]s?|recurrentes?)\b.*\b(?:depositos?|aportes?|aportaciones?)\b|\b(?:depositos?|aportes?|aportaciones?)\b.*\b(?:automatic[oa]s?|recurrentes?)\b/, "recurring"],
    [/\b(?:deposit\w*|microdeposit\w*)\b|conect\w*.*\bbanco\b|cuenta bancaria/, "deposit"],
    [/\b(?:membresias?|planes?|suscripciones?|tarifas?|comisiones?|premium|basico)\b|cuanto (?:cuesta|cobran)|\bprecios?\b/, "plans"],
    [/\b(?:ira|roth|jubilacion|retiro|mc futuro)\b/, "retirement"],
    [/\bmc inversiones\b|cuenta (?:individual|de inversiones|de inversion)/, "investing"],
    [/\b(?:minimo|minima|empezar|comenzar)\b|\b5 dolares\b|\$\s*5/, "start"],
    [/\b(?:ingresar|entrar|inicio de sesion|login|contrasena)\b|inici(?:ar|o) sesion/, "login"],
    [/\b(?:registrarme|registro|registrar|registrate)\b|(?:crear|abrir) (?:una |mi |tu )?cuenta/, "register"],
    [/\b(?:aprende|aprender|cursos?|videos?|educacion)\b/, "education"],
    [/\b(?:portafolios?|carteras?|robo.?advisor|rebalance\w*|dividendos)\b|como funciona|que es el menudo cuenta/, "portfolio"]
  ];

  function appendQuestion(question, text, links) {
    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = question;
    const reply = document.createElement("p");
    reply.className = "chat-answer";
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
    thread.append(message, reply);
    thread.scrollTop = thread.scrollHeight;
  }

  function ask(topic, question) {
    const [text, links] = answers[topic];
    appendQuestion(question, text, links);
    input.value = "";
  }

  launcher.addEventListener("click", () => panel.showModal());
  panel.querySelector(".chat-close").addEventListener("click", () => panel.close());
  panel.addEventListener("close", () => launcher.focus());
  const topics = panel.querySelector(".chat-topics");
  for (const [topic, label] of [["deposit", "Hacer un depósito"], ["password", "Recuperar acceso"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.topic = topic;
    button.textContent = label;
    topics.append(button);
  }

  const note = panel.querySelector(".chat-note");
  const email = document.createElement("a");
  email.href = supportLinks[1][1];
  email.textContent = "correo";
  const whatsapp = note.querySelector("a");
  whatsapp.textContent = "WhatsApp";
  note.replaceChildren("Soporte de EMC por ", whatsapp, " o ", email, ".");

  panel.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.topic, button.textContent.trim()));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const normalized = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/\b\d{3}-\d{2}-\d{4}\b|\b\d{9,}\b|[^\s@]+@[^\s@]+\.[^\s@]+|(?:clave|contrasena|ssn|(?:mi )?codigo(?: de verificacion)?)\s*[:=]|(?:mi codigo es|codigo de verificacion)\s+\d{4,8}\b/.test(normalized)) {
      appendQuestion("Pregunta con datos personales", "Por seguridad, evita compartir datos personales aquí. Si necesitas ayuda con tu cuenta, contacta a soporte.", supportLinks);
      input.value = "";
      return;
    }
    const match = intents.find(([pattern]) => pattern.test(normalized));
    ask(match?.[1] || "unknown", question);
  });

  widget.hidden = false;
})();
