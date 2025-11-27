const idSala = localStorage.getItem("idSala");
const idJogador = localStorage.getItem("idJogador");
const nomeJogador = localStorage.getItem("nomeJogador");

if (!idSala || !idJogador) {
    alert("Erro: dados não encontrados. Volte para a tela inicial.");
    window.location.href = "index.html";
}

const socket = io("http://localhost:3000");

const titulo = document.getElementById("perguntaTitulo");
const textoPergunta = document.getElementById("textoPergunta");
const alternativasBox = document.getElementById("alternativas");
const placarBox = document.getElementById("placar");
const statusBox = document.getElementById("status");

// 1) Conectar ao servidor e entrar na sala
socket.on("connect", () => {
    socket.emit("entrarSala", {
        idSala,
        idJogador
    });
});

// 2) Nova pergunta recebida
socket.on("novaPergunta", (data) => {
    statusBox.innerHTML = "";

    titulo.innerText = `Pergunta ${data.index}/${data.total}`;
    textoPergunta.innerText = data.enunciado;  // <<< enunciado FIXO na tela

    alternativasBox.innerHTML = "";
    data.alternativas.forEach((alt, idx) => {
        const letra = ["a", "b", "c", "d"][idx];

        const btn = document.createElement("button");
        btn.innerText = `${letra.toUpperCase()}) ${alt}`;
        btn.onclick = () => responder(letra);

        alternativasBox.appendChild(btn);
    });
});

// 3) Quando alguém marca ponto
socket.on("ponto", (data) => {
    statusBox.innerHTML = `🎯 ${data.nome} ganhou 1 ponto!`;
});

// 4) Fim de jogo
socket.on("fimDeJogo", (data) => {
    alternativasBox.innerHTML = "";
    textoPergunta.innerHTML = "";
    titulo.innerHTML = "🏁 Fim de Jogo";

    let html = "<h3>Ranking Final</h3>";
    data.ranking.forEach((p) => {
        html += `<p>${p.nome} — ${p.pontos} pontos</p>`;
    });

    placarBox.innerHTML = html;
});

// 5) Responder pergunta
function responder(letra) {
    socket.emit("responder", {
        idSala,
        idJogador,
        alternativa: letra
    });

    statusBox.innerHTML = "⏳ Aguardando...";
}
