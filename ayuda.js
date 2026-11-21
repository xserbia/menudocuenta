(() => {
  "use strict";

  const form = document.querySelector(".help-search");
  const query = document.querySelector("#help-query");
  const filter = document.querySelector(".help-filter");
  const topicSelect = document.querySelector("#help-topic");
  const heading = document.querySelector("#help-faq-title");
  const results = document.querySelector(".help-results");
  const empty = document.querySelector(".help-empty");
  const stopWords = new Set(["a", "al", "como", "con", "de", "del", "el", "en", "es", "la", "las", "los", "mi", "para", "por", "que", "se", "un", "una", "y"]);

  function normalize(value) {
    return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  }

  function indexQuestion(detail, topicName) {
    const answer = detail.querySelector(".help-answer");
    const walker = document.createTreeWalker(answer, NodeFilter.SHOW_TEXT);
    const parts = [detail.querySelector("summary").textContent, topicName];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent);
    return { detail, text: normalize(parts.join(" ")) };
  }

  const topics = Array.from(document.querySelectorAll(".help-topic"), (section) => ({
    section,
    questions: Array.from(section.querySelectorAll("details"), (detail) =>
      indexQuestion(detail, section.querySelector("h3").textContent))
  }));

  function updateResults() {
    const words = normalize(query.value).match(/[\p{L}\p{N}]+/gu) || [];
    const keywords = words.filter((word) => !stopWords.has(word));
    const terms = keywords.length ? keywords : words;
    const topic = topicSelect.value;
    let count = 0;

    for (const { section, questions } of topics) {
      const inTopic = !topic || section.dataset.topic === topic;
      let matches = 0;
      for (const { detail, text } of questions) {
        const visible = inTopic && terms.every((term) => text.includes(term));
        detail.hidden = !visible;
        if (visible) matches++;
      }
      section.hidden = matches === 0;
      count += matches;
    }

    empty.hidden = count !== 0;
    results.textContent = count === 1 ? "1 pregunta encontrada" : `${count} preguntas encontradas`;
  }

  query.addEventListener("input", updateResults);
  topicSelect.addEventListener("change", updateResults);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateResults();
    heading.focus();
    heading.scrollIntoView({ block: "start" });
  });
  empty.querySelector("button").addEventListener("click", () => {
    query.value = "";
    topicSelect.value = "";
    updateResults();
    heading.focus();
  });

  const requestedTopic = new URLSearchParams(window.location.search).get("tema");
  if (topics.some(({ section }) => section.dataset.topic === requestedTopic)) {
    topicSelect.value = requestedTopic;
  }

  form.hidden = false;
  filter.hidden = false;
  updateResults();
})();
