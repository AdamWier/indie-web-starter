const dateTimeFormat = new Intl.DateTimeFormat(window.navigator.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

function adjustDateTimes(){		
    document
        .querySelectorAll(".dt-published")
        .forEach(
            (el) => el.textContent = dateTimeFormat.format(Date.parse(el.textContent.trim()))
        );
}