export function httpGet(theUrl: string): string {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

export function isDom(e: any) {
  if (typeof HTMLElement === "object") {
    return e instanceof HTMLElement;
  }
  return (
    e &&
    typeof e === "object" &&
    e.nodeType === 1 &&
    typeof e.nodeName === "string"
  );
}
