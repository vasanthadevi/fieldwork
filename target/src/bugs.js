// Seeded display bugs for Fieldwork's evaluation. Off unless the URL carries ?bug=<id>.
export const bug = new URLSearchParams(window.location.search).get('bug')
export const hasBug = (id) => bug === id
