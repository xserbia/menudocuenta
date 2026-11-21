"use strict";

{
  const triggers = [...document.querySelectorAll("[data-founder-video]")];
  const desktopTrigger = document.querySelector(".founder-video-control [data-founder-video]");
  let activeTrigger;
  const preview = document.querySelector(".founder-preview");
  const dialog = document.querySelector("#video-dialog");
  const dialogTitle = dialog.querySelector("#video-dialog-title");
  const player = dialog.querySelector(".video-dialog-player");
  const founderSource = document.querySelector("#video-ahorro iframe");
  const canPreview = window.matchMedia("(min-width: 46.01rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  let previewTimer;

  function stopPreview() {
    window.clearTimeout(previewTimer);
    if (!preview) return;
    preview.hidden = true;
    preview.replaceChildren();
  }

  function makePlayer(source, isPreview = false) {
    const url = new URL(source.src);
    url.searchParams.set("autoplay", "1");
    if (isPreview) {
      url.searchParams.set("muted", "1");
      url.searchParams.set("controls", "0");
      url.searchParams.set("loop", "1");
      url.searchParams.set("autopause", "0");
    }
    const frame = document.createElement("iframe");
    frame.src = url.href;
    frame.title = source.title;
    frame.allow = isPreview ? "autoplay" : "autoplay; fullscreen; picture-in-picture";
    frame.allowFullscreen = !isPreview;
    if (isPreview) frame.tabIndex = -1;
    return frame;
  }

  function schedulePreview(event) {
    if (event.pointerType !== "mouse" || !canPreview.matches || dialog.open) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      preview.replaceChildren(makePlayer(founderSource, true));
      preview.hidden = false;
    }, 220);
  }

  desktopTrigger?.addEventListener("pointerenter", schedulePreview);
  desktopTrigger?.addEventListener("pointerleave", stopPreview);
  canPreview.addEventListener("change", stopPreview);

  if (typeof dialog.showModal === "function") {
    function openVideo(source, trigger) {
      stopPreview();
      activeTrigger = trigger;
      dialogTitle.textContent = source.title;
      dialog.showModal();
      player.replaceChildren(makePlayer(source));
    }

    for (const trigger of triggers) {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", dialog.id);
      trigger.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openVideo(founderSource, trigger);
      });
    }

    const desktopVideos = window.matchMedia("(min-width: 46.01rem)");
    for (const card of document.querySelectorAll(".video-card-player")) {
      const frame = card.querySelector("iframe");
      const trigger = card.querySelector(".video-card-open");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", dialog.id);
      trigger.addEventListener("click", () => openVideo(frame, trigger));

      function updateVideoCard() {
        const useDialog = desktopVideos.matches;
        trigger.hidden = !useDialog;
        frame.inert = useDialog;
        if (useDialog) frame.setAttribute("tabindex", "-1");
        else frame.removeAttribute("tabindex");
      }

      desktopVideos.addEventListener("change", updateVideoCard);
      updateVideoCard();
    }

    dialog.addEventListener("close", () => {
      player.replaceChildren();
      const focusTarget = activeTrigger?.getClientRects().length
        ? activeTrigger
        : activeTrigger?.parentElement.querySelector("iframe") ??
          triggers.find((trigger) => trigger.getClientRects().length);
      focusTarget?.focus({ preventScroll: true });
    });
  }
}
