// Compatibility for old links on static hosts without server redirect rules.
const destination = new URL(document.currentScript.dataset.destination, location.origin);
destination.search = location.search;
destination.hash = location.hash || destination.hash;
location.replace(destination.href);
