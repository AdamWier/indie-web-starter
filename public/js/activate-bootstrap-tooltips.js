function activateBootstrapTooltips(){
    document
        .querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach(
            tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
        )
}