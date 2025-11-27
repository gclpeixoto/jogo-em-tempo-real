require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const db = require('./db');

// Rotas REST
const salaRoutes = require('./routes/salaRoutes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// Rotas REST
app.use("/salas", salaRoutes);

// Health-check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Teste DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 AS ok');
    res.json({ db: 'connected', row: result.rows[0] });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ db: 'error', error: err.message });
  }
});

const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Estado das salas
const salasState = {};
/*
  salasState = {
    [idSala]: {
      status: "aguardando" | "jogando",
      jogadores: { idJogador: { nome, pontos, socketId }},
      perguntas: [...],
      perguntaIndex: 0
    }
  }
*/

// ==========================
// Funções internas do Socket
// ==========================

// Iniciar partida automaticamente
async function tentarIniciarPartida(idSala) {
  const sala = salasState[idSala];
  if (!sala) return;

  const numJogadores = Object.keys(sala.jogadores).length;

  // mínimo 2 jogadores
  if (numJogadores < 2) return;

  // já está jogando?
  if (sala.status === "jogando") return;

  console.log(`🚀 Iniciando partida na sala ${idSala}`);

  sala.status = "jogando";

  // Carregar perguntas aleatórias
  const perguntasQuery = await db.query(`
      SELECT 
        id_pergunta,
        texto,
        alternativa_a,
        alternativa_b,
        alternativa_c,
        alternativa_d,
        resposta_correta
      FROM jogo.pergunta
      WHERE id_grupo = 1
      ORDER BY RANDOM()
      LIMIT 10;

  `);

  sala.perguntas = perguntasQuery.rows;
  sala.perguntaIndex = 0;

  enviarPerguntaAtual(idSala);
}

// Enviar pergunta para a sala
function enviarPerguntaAtual(idSala) {
  const sala = salasState[idSala];
  if (!sala) return;

  const pergunta = sala.perguntas[sala.perguntaIndex];
  if (!pergunta) return;

  io.to(idSala).emit("novaPergunta", {
    index: sala.perguntaIndex + 1,
    total: sala.perguntas.length,
    enunciado: pergunta.texto,
    alternativas: [
      pergunta.alternativa_a,
      pergunta.alternativa_b,
      pergunta.alternativa_c,
      pergunta.alternativa_d
    ]
  });

  console.log(`📤 Pergunta ${sala.perguntaIndex + 1} enviada para sala ${idSala}`);
}
function gerarRanking(jogadores) {
  return Object.entries(jogadores)
    .map(([id, j]) => ({
      idJogador: id,
      nome: j.nome,
      pontos: j.pontos
    }))
    .sort((a, b) => b.pontos - a.pontos);
}

// ==================
// Socket.IO Principal
// ==================

io.on("connection", (socket) => {
  console.log(`🟢 Socket conectado: ${socket.id}`);

  // teste rápido
  socket.on("ping-server", () => {
    socket.emit("pong-server", { time: new Date().toISOString() });
  });

  // Entrar na sala
  socket.on("entrarSala", async ({ idSala, idJogador }) => {
    try {
      console.log("📩 entrarSala:", { idSala, idJogador });

      if (!idSala || !idJogador) {
        socket.emit("erro", { msg: "idSala e idJogador são obrigatórios." });
        return;
      }

      // validar sala no DB
      const salaResult = await db.query(
        "SELECT * FROM jogo.sala WHERE id_sala = $1",
        [idSala]
      );
      const salaDB = salaResult.rows[0];

      if (!salaDB) {
        socket.emit("erro", { msg: "Sala não encontrada." });
        return;
      }

      // validar jogador no DB
      const jogadorResult = await db.query(
        "SELECT * FROM jogo.jogador WHERE id_jogador = $1",
        [idJogador]
      );
      const jogadorDB = jogadorResult.rows[0];

      if (!jogadorDB) {
        socket.emit("erro", { msg: "Jogador não encontrado." });
        return;
      }

      // Criar estado da sala se necessário
      if (!salasState[idSala]) {
        salasState[idSala] = {
          status: "aguardando",
          jogadores: {},
          perguntas: [],
          perguntaIndex: 0
        };
      }

      // registrar jogador
      salasState[idSala].jogadores[idJogador] = {
        nome: jogadorDB.nome,
        pontos: 0,
        socketId: socket.id
      };

      socket.join(idSala);

      // enviar lista de jogadores
      io.to(idSala).emit("jogadoresAtualizados", {
        jogadores: salasState[idSala].jogadores
      });

      socket.emit("entrouNaSala", {
        idSala,
        jogador: salasState[idSala].jogadores[idJogador]
      });

      console.log(`👤 Jogador ${jogadorDB.nome} entrou na sala ${idSala}`);

      // tentar iniciar o jogo
      await tentarIniciarPartida(idSala);

    } catch (err) {
      console.error("Erro no entrarSala:", err);
      socket.emit("erro", { msg: "Erro ao entrar na sala." });
    }
  });
  // Jogador enviando resposta
  socket.on("responder", async ({ idSala, idJogador, alternativa }) => {
    try {
      const sala = salasState[idSala];
      if (!sala) return;

      const jogador = sala.jogadores[idJogador];
      if (!jogador) return;

      const perguntaAtual = sala.perguntas[sala.perguntaIndex];

      if (!perguntaAtual) {
        socket.emit("erro", { msg: "Nenhuma pergunta ativa." });
        return;
      }

      const correta = perguntaAtual.resposta_correta.toLowerCase().trim();
      const recebida = alternativa.toLowerCase().trim();

      const acertou = correta === recebida;

      console.log(`📝 Jogador ${jogador.nome} respondeu '${alternativa}' | Correta: '${correta}'`);

      // Atualizar pontuação
      if (acertou) {
        jogador.pontos += 1;

        io.to(idSala).emit("ponto", {
          idJogador,
          nome: jogador.nome,
          pontos: jogador.pontos
        });

        // Verificar vencedor (5 pontos)
        if (jogador.pontos >= 5) {
          console.log(`🏆 Jogador ${jogador.nome} venceu a partida!`);

          io.to(idSala).emit("fimDeJogo", {
            vencedor: jogador.nome,
            idJogador,
            pontos: jogador.pontos,
            ranking: gerarRanking(sala.jogadores)
          });

          sala.status = "finalizado";
          return;
        }
      }

      // Próxima pergunta
      sala.perguntaIndex++;

      if (sala.perguntaIndex >= sala.perguntas.length) {
        // acabou o jogo, mas ninguém chegou a 5
        io.to(idSala).emit("fimDeJogo", {
          vencedor: null,
          ranking: gerarRanking(sala.jogadores)
        });
        sala.status = "finalizado";
        return;
      }

      // enviar nova pergunta
      enviarPerguntaAtual(idSala);

    } catch (err) {
      console.error("Erro no responder:", err);
      socket.emit("erro", { msg: "Erro ao processar resposta." });
    }
  });

  // desconexão
  socket.on("disconnect", () => {
    console.log(`🔴 Socket desconectado: ${socket.id}`);

    for (const salaId in salasState) {
      for (const jogadorId in salasState[salaId].jogadores) {
        if (salasState[salaId].jogadores[jogadorId].socketId === socket.id) {

          delete salasState[salaId].jogadores[jogadorId];

          io.to(salaId).emit("jogadoresAtualizados", {
            jogadores: salasState[salaId].jogadores
          });
        }
      }
    }
  });
});

// ============================
// Inicialização do Servidor
// ============================

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🩺 Health-check: http://localhost:${PORT}/health`);
  console.log(`🗄 Teste DB: http://localhost:${PORT}/test-db`);
});
