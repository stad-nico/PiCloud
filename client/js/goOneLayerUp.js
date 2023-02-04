import { getCookie, setCookie } from "./cookies.js";
import setInteractivePath from "./interactivePath.js";

export default function goOneLayerUp() {
	let newPath = getCookie("path").replace(/[^\/]+\/$/im, "");
}
