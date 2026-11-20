(() => {
  "use strict";

  const widget = document.querySelector("[data-emc-chat]");
  const panel = widget.querySelector("dialog");
  if (typeof panel.showModal !== "function") return;

  const launcher = widget.querySelector(".chat-launcher");
  const thread = panel.querySelector(".chat-thread");
  const form = panel.querySelector("form");
  const input = form.elements.question;
  const site = "https://www.elmenudocuenta.com";
  const app = "https://app.elmenudocuenta.com";
  const supportLink = ["Contactar a soporte", "https://wa.me/message/P5RVRV7B3XENP1"];

  const answers = {
    start: ["Puedes empezar a invertir con tan solo $5. Se aplican tarifas de suscripción según la membresía que elijas.", ["Cómo empezar", app + "/faq/mc-inversiones"]],
    investing: ["MC Inversiones es una cuenta individual para invertir en un portafolio según tu objetivo, plazo y tolerancia al riesgo.", ["Conoce MC Inversiones", app + "/faq/mc-inversiones"]],
    retirement: ["MC Futuro ofrece cuentas individuales para el retiro, entre ellas la IRA Tradicional y la Roth IRA.", ["Conoce MC Futuro", app + "/faq/mc-retirement"]],
    plans: ["Puedes comparar las membresías y consultar sus tarifas vigentes en la página de planes.", ["Ver membresías", "./membresia.html"]],
    support: ["Para consultas sobre tu cuenta, depósitos o acceso, escribe al equipo de soporte por el canal oficial.", supportLink],
    register: ["Puedes crear una cuenta desde la app de El Menudo Cuenta.", ["Registrarme", app + "/register"]],
    login: ["Puedes ingresar desde la app de El Menudo Cuenta. Si tienes problemas de acceso, usa el enlace a soporte debajo del chat.", ["Ingresar a mi cuenta", app + "/users/log_in"]],
    custody: ["El Menudo Cuenta administra la estrategia. Interactive Brokers LLC, miembro de FINRA/SIPC, actúa como corredor y custodio. Las inversiones pueden perder valor.", ["Ver información legal", site + "/legal"]],
    recurring: ["Puedes programar aportaciones recurrentes. La app ofrece aportaciones desde $5 por día, semana o mes.", ["Ver cómo funcionan los aportes", app + "/faq/mc-inversiones"]],
    portfolio: ["El Menudo Cuenta propone un portafolio según los objetivos, el plazo y la tolerancia al riesgo que indicas en la app.", ["Cómo funciona EMC", site + "/que-hace-emc"]],
    education: ["En Aprende encontrarás videos y cursos en español sobre ahorro e inversión.", ["Ir a Aprende", "./aprende.html"]],
    risks: ["Invertir implica riesgos, incluida la posible pérdida del capital invertido. Los productos de inversión no están asegurados por la FDIC y no tienen garantía bancaria.", ["Ver información legal", site + "/legal"]],
    personalized: ["Puedo orientarte sobre el servicio y sus recursos educativos. Si ya tienes cuenta, usa la app para revisar tu perfil y la estrategia que EMC te propone.", ["Ir a la app", app + "/users/log_in"]],
    unknown: ["No encontré una respuesta a esa pregunta. Puedes consultar las preguntas frecuentes o usar el enlace a soporte debajo del chat.", ["Ver preguntas frecuentes", site + "/faq"]]
  };

  const intents = [
    [/\b(?:saldo|deposito|retirar|retiros|problema|contrasena|error|reclamo|soporte|whatsapp)\b|no puedo|no me deja|no llega|retiro (?:esta |fue )?(?:pendiente|rechazado|fallido)|(?:mi|el|un) retiro (?:de dinero|de fondos|no)|(?:estado de|donde esta|cuando (?:llega|recibo)) mi retiro/, "support"],
    [/me recomiendas|deberia (?:invertir|comprar|vender)|que (?:accion|etf|portafolio) (?:compro|elijo|me conviene)|cuanto (?:debo|deberia) invertir/, "personalized"],
    [/\b(?:fdic|riesgos?|perder|perdida|garantia)\b/, "risks"],
    [/\b(?:custodio|custodia|ibkr|broker|corredor|banco)\b|interactive brokers|seguro.*dinero|dinero.*seguro/, "custody"],
    [/\b(?:pagos?|costos?|cuesta|precios?|tarifas?|comisiones?|membresias?|planes?|suscripciones?)\b/, "plans"],
    [/\b(?:recurrente|recurrentes|frecuencia|periodic[oa]s?)\b|aport(?:e|es|aciones?) automati/, "recurring"],
    [/\b(?:ira|roth|jubilacion|retiro|mc futuro)\b/, "retirement"],
    [/\bmc inversiones\b|cuenta (?:individual|de inversiones|de inversion)/, "investing"],
    [/\b(?:minimo|empezar|comenzar)\b|\b5 dolares\b|\$\s*5/, "start"],
    [/\b(?:ingresar|entrar|login)\b|inici(?:ar|o) sesion/, "login"],
    [/\b(?:registrarme|registro|registrar|registro)\b|(?:crear|abrir) (?:una |mi )?cuenta/, "register"],
    [/\b(?:aprende|aprender|cursos?|videos?|educacion)\b/, "education"],
    [/\b(?:portafolios?|carteras?|robo.?advisor)\b|como funciona|que es el menudo cuenta/, "portfolio"]
  ];

  function appendQuestion(question, text, link) {
    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = question;
    const reply = document.createElement("p");
    reply.className = "chat-answer";
    reply.textContent = text;
    if (link) {
      const anchor = document.createElement("a");
      anchor.textContent = link[0];
      anchor.href = link[1];
      reply.append(document.createElement("br"), anchor);
    }
    thread.append(message, reply);
    thread.scrollTop = thread.scrollHeight;
  }

  function ask(topic, question) {
    const [text, link] = answers[topic];
    appendQuestion(question, text, link);
    input.value = "";
  }

  launcher.addEventListener("click", () => panel.showModal());
  panel.querySelector(".chat-close").addEventListener("click", () => panel.close());
  panel.addEventListener("close", () => launcher.focus());
  panel.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.topic, button.textContent.trim()));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const normalized = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/\b\d{3}-\d{2}-\d{4}\b|\b\d{9,}\b|[^\s@]+@[^\s@]+\.[^\s@]+|(?:clave|contrasena|ssn)\s*[:=]/.test(normalized)) {
      appendQuestion("Pregunta con datos personales", "Por seguridad, evita compartir datos personales aquí. Si necesitas ayuda con tu cuenta, contacta a soporte.", supportLink);
      input.value = "";
      return;
    }
    const match = intents.find(([pattern]) => pattern.test(normalized));
    ask(match?.[1] || "unknown", question);
  });

  widget.hidden = false;
})();
