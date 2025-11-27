const express = require("express");
const router = express.Router();

const salaRepo = require("../repositories/salaRepo");
const jogadorRepo = require("../repositories/jogadorRepo");

// POST /salas - criar sala
router.post("/", async (req, res) => {
  try {
    // Grupo fixo = 1 (D1)
    const novaSala = await salaRepo.criarSala(1);
    return res.status(201).json(novaSala);

  } catch (err) {
    console.error("Erro ao criar sala:", err);
    return res.status(500).json({ error: "Erro ao criar sala." });
  }
});

// POST /salas/entrar - entrar na sala via ID (B2)
router.post("/entrar", async (req, res) => {
  try {
    const { idSala, nomeJogador } = req.body;

    if (!idSala || !nomeJogador) {
      return res.status(400).json({ error: "idSala e nomeJogador são obrigatórios." });
    }

    // C2 - Se sala não existir → erro
    const sala = await salaRepo.buscarSalaPorId(idSala);
    if (!sala) {
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    // Criar jogador
    const jogador = await jogadorRepo.criarJogador(idSala, nomeJogador);

    return res.status(201).json({
      sala,
      jogador
    });

  } catch (err) {
    console.error("Erro ao entrar na sala:", err);
    return res.status(500).json({ error: "Erro ao entrar na sala." });
  }
});

// GET /salas/:id - buscar detalhes da sala
router.get("/:idSala", async (req, res) => {
  try {
    const { idSala } = req.params;

    const sala = await salaRepo.buscarSalaPorId(idSala);
    if (!sala) {
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    const jogadores = await jogadorRepo.listarJogadoresDaSala(idSala);

    return res.json({
      sala,
      jogadores
    });

  } catch (err) {
    console.error("Erro ao buscar sala:", err);
    return res.status(500).json({ error: "Erro ao buscar sala." });
  }
});

module.exports = router;
    