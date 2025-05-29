export function httpGet(theUrl: string): string {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    if (xmlHttp.status === 200) return xmlHttp.responseText;
    throw new Error("Resource does not exist.")
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
